package com.example.security.scheduling;

import com.example.security.Users.User;
import com.example.security.UserRepository;
import com.example.security.scheduling.dto.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SchedulingService {

    private final ScheduledPostRepository scheduledPostRepository;
    private final PostHistoryRepository postHistoryRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String VIDEO_INIT_URL  = "https://open.tiktokapis.com/v2/post/publish/video/init/";
    private static final String VIDEO_UPLOAD_URL = "https://open.tiktokapis.com/v2/post/publish/video/upload/";
    private static final String VIDEO_STATUS_URL = "https://open.tiktokapis.com/v2/post/publish/status/fetch/";

    // ========================================
    // SCHEDULE A POST
    // ========================================
    public ScheduledPostDTO schedulePost(Long userId, SchedulePostRequest request) {
        log.info("Scheduling post for userId={}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getScheduledAt().isBefore(LocalDateTime.now().plusMinutes(5))) {
            throw new IllegalArgumentException("Scheduled time must be at least 5 minutes in the future");
        }

        ScheduledPost post = ScheduledPost.builder()
                .user(user)
                .title(request.getTitle())
                .caption(request.getCaption())
                .hashtags(request.getHashtags())
                .videoFilePath(request.getVideoFilePath())
                .privacyLevel(request.getPrivacyLevel() != null
                        ? request.getPrivacyLevel()
                        : ScheduledPost.PrivacyLevel.PUBLIC)
                .scheduledAt(request.getScheduledAt())
                .status(ScheduledPost.PostStatus.PENDING)
                .build();

        ScheduledPost saved = scheduledPostRepository.save(post);
        log.info("Post scheduled — id={} for {}", saved.getId(), saved.getScheduledAt());
        return toDTO(saved);
    }

    // ========================================
    // CANCEL A SCHEDULED POST
    // ========================================
    public void cancelPost(Long userId, Long postId) {
        ScheduledPost post = scheduledPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }
        if (post.getStatus() != ScheduledPost.PostStatus.PENDING) {
            throw new IllegalStateException("Only PENDING posts can be cancelled");
        }

        post.setStatus(ScheduledPost.PostStatus.CANCELLED);
        scheduledPostRepository.save(post);
        log.info("Post {} cancelled by userId={}", postId, userId);
    }

    // ========================================
    // GET SCHEDULED POSTS FOR USER
    // ========================================
    public List<ScheduledPostDTO> getUserScheduledPosts(Long userId) {
        return scheduledPostRepository.findByUserId(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ========================================
    // GET POST HISTORY FOR USER
    // ========================================
    public List<PostHistoryDTO> getUserPostHistory(Long userId) {
        return postHistoryRepository.findByUserIdOrderByPostedAtDesc(userId)
                .stream().map(this::toHistoryDTO).collect(Collectors.toList());
    }

    // ========================================
    // SCHEDULER JOB — runs every minute
    // ========================================
    @Scheduled(fixedDelay = 60000)
    public void publishDuePosts() {
        List<ScheduledPost> duePosts =
                scheduledPostRepository.findPostsDueForPublishing(LocalDateTime.now());

        if (duePosts.isEmpty()) return;

        log.info("Scheduler: {} posts due for publishing", duePosts.size());

        for (ScheduledPost post : duePosts) {
            try {
                publishPost(post);
            } catch (Exception e) {
                log.error("Publish failed for postId={}: {}", post.getId(), e.getMessage());
                handlePublishFailure(post, e.getMessage());
            }
        }
    }

    // ========================================
    // PUBLISH ONE POST TO TIKTOK
    // ========================================
    private void publishPost(ScheduledPost post) throws Exception {
        log.info("Publishing postId={} for userId={}", post.getId(), post.getUser().getId());

        post.setStatus(ScheduledPost.PostStatus.PUBLISHING);
        scheduledPostRepository.save(post);

        User user = post.getUser();
        String accessToken = user.getTiktokAccessToken();

        // Step 1 — Init upload
        String publishId = initVideoUpload(accessToken, post);
        log.info("TikTok publish init OK — publishId={}", publishId);

        // Step 2 — Upload video file
        uploadVideoFile(accessToken, publishId, post.getVideoFilePath());
        log.info("Video file uploaded for publishId={}", publishId);

        // Step 3 — Mark as published
        post.setStatus(ScheduledPost.PostStatus.PUBLISHED);
        post.setTiktokPublishId(publishId);
        scheduledPostRepository.save(post);

        // Step 4 — Create history record
        PostHistory history = PostHistory.builder()
                .user(user)
                .scheduledPost(post)
                .tiktokVideoId(publishId)
                .caption(post.getCaption())
                .hashtags(post.getHashtags())
                .postedAt(LocalDateTime.now())
                .source(PostHistory.PostSource.SCHEDULED)
                .build();
        postHistoryRepository.save(history);

        log.info("Post {} published successfully", post.getId());
    }

    // ========================================
    // TIKTOK VIDEO INIT
    // ========================================
    private String initVideoUpload(String accessToken, ScheduledPost post) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        File videoFile = new File(post.getVideoFilePath());
        long fileSize = videoFile.length();

        Map<String, Object> sourceInfo = new HashMap<>();
        sourceInfo.put("source", "FILE_UPLOAD");
        sourceInfo.put("video_size", fileSize);
        sourceInfo.put("chunk_size", fileSize);
        sourceInfo.put("total_chunk_count", 1);

        Map<String, Object> postInfo = new HashMap<>();
        postInfo.put("title", post.getCaption() + " " + (post.getHashtags() != null ? post.getHashtags() : ""));
        postInfo.put("privacy_level", post.getPrivacyLevel().name());
        postInfo.put("disable_duet", false);
        postInfo.put("disable_comment", false);
        postInfo.put("disable_stitch", false);

        Map<String, Object> body = new HashMap<>();
        body.put("source_info", sourceInfo);
        body.put("post_info", postInfo);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.exchange(
                VIDEO_INIT_URL, HttpMethod.POST, request, String.class);

        JsonNode json = objectMapper.readTree(response.getBody());

        if (json.has("error") && !"ok".equalsIgnoreCase(json.get("error").get("code").asText())) {
            throw new RuntimeException("TikTok init error: " + json.get("error").get("message").asText());
        }

        return json.get("data").get("publish_id").asText();
    }

    // ========================================
    // TIKTOK VIDEO FILE UPLOAD
    // ========================================
    private void uploadVideoFile(String accessToken, String publishId, String filePath) throws Exception {
        File videoFile = new File(filePath);
        byte[] videoBytes = Files.readAllBytes(videoFile.toPath());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.set("Content-Range", "bytes 0-" + (videoBytes.length - 1) + "/" + videoBytes.length);
        headers.set("Content-Length", String.valueOf(videoBytes.length));

        Map<String, Object> urlBody = new HashMap<>();
        urlBody.put("publish_id", publishId);

        // First get the upload URL
        HttpHeaders jsonHeaders = new HttpHeaders();
        jsonHeaders.set("Authorization", "Bearer " + accessToken);
        jsonHeaders.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> urlRequest = new HttpEntity<>(urlBody, jsonHeaders);
        ResponseEntity<String> urlResponse = restTemplate.exchange(
                VIDEO_UPLOAD_URL, HttpMethod.POST, urlRequest, String.class);

        JsonNode urlJson = objectMapper.readTree(urlResponse.getBody());
        String uploadUrl = urlJson.get("data").get("upload_url").asText();

        // Upload the actual bytes
        HttpEntity<byte[]> uploadRequest = new HttpEntity<>(videoBytes, headers);
        restTemplate.exchange(uploadUrl, HttpMethod.PUT, uploadRequest, String.class);
    }

    // ========================================
    // HANDLE PUBLISH FAILURE
    // ========================================
    private void handlePublishFailure(ScheduledPost post, String reason) {
        post.setRetryCount(post.getRetryCount() + 1);
        post.setFailureReason(reason);

        // After 3 retries mark as permanently failed
        if (post.getRetryCount() >= 3) {
            post.setStatus(ScheduledPost.PostStatus.FAILED);
            log.warn("Post {} permanently failed after 3 retries", post.getId());
        } else {
            // Reset to PENDING — will retry next minute
            post.setStatus(ScheduledPost.PostStatus.PENDING);
            // Push scheduled time 5 min forward to avoid hammering API
            post.setScheduledAt(LocalDateTime.now().plusMinutes(5));
            log.info("Post {} will retry in 5 min (attempt {})", post.getId(), post.getRetryCount());
        }

        scheduledPostRepository.save(post);
    }

    // ========================================
    // MAPPERS
    // ========================================
    private ScheduledPostDTO toDTO(ScheduledPost p) {
        return ScheduledPostDTO.builder()
                .id(p.getId())
                .title(p.getTitle())
                .caption(p.getCaption())
                .hashtags(p.getHashtags())
                .privacyLevel(p.getPrivacyLevel())
                .scheduledAt(p.getScheduledAt())
                .status(p.getStatus())
                .tiktokPublishId(p.getTiktokPublishId())
                .failureReason(p.getFailureReason())
                .retryCount(p.getRetryCount())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private PostHistoryDTO toHistoryDTO(PostHistory h) {
        return PostHistoryDTO.builder()
                .id(h.getId())
                .tiktokVideoId(h.getTiktokVideoId())
                .caption(h.getCaption())
                .hashtags(h.getHashtags())
                .postedAt(h.getPostedAt())
                .viewsAtPost(h.getViewsAtPost())
                .likesAtPost(h.getLikesAtPost())
                .commentsAtPost(h.getCommentsAtPost())
                .sharesAtPost(h.getSharesAtPost())
                .source(h.getSource())
                .build();
    }
}
