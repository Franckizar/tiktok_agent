package com.example.security.analytics;

import com.example.security.Users.User;
import com.example.security.UserRepository;
import com.example.security.analytics.dto.AnalyticsSnapshotDTO;
import com.example.security.analytics.dto.VideoSummaryDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final AnalyticsSnapshotRepository analyticsSnapshotRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String VIDEO_LIST_URL = "https://open.tiktokapis.com/v2/video/list/";

    // ========================================
    // SYNC VIDEOS FROM TIKTOK — called manually or by scheduler
    // ========================================
    public void syncUserVideos(Long userId) {
        log.info("Starting video sync for userId={}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        if (!user.isTiktokConnected() || user.getTiktokAccessToken() == null) {
            log.warn("User {} has no TikTok token — skipping sync", userId);
            return;
        }

        try {
            List<JsonNode> videos = fetchVideosFromTikTok(user.getTiktokAccessToken());
            log.info("Fetched {} videos from TikTok for userId={}", videos.size(), userId);

            for (JsonNode video : videos) {
                createSnapshot(user, video);
            }

            log.info("Sync complete for userId={} — {} snapshots saved", userId, videos.size());

        } catch (Exception e) {
            log.error("Video sync failed for userId={}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Video sync failed: " + e.getMessage(), e);
        }
    }

    // ========================================
    // SCHEDULED DAILY SYNC — runs at 3am every day
    // ========================================
    @Scheduled(cron = "0 0 3 * * *")
    public void scheduledDailySync() {
        log.info("Daily analytics sync starting...");

        List<User> connectedUsers = userRepository.findByTiktokConnectedTrue();
        log.info("Found {} TikTok-connected users to sync", connectedUsers.size());

        for (User user : connectedUsers) {
            try {
                syncUserVideos(user.getId());
            } catch (Exception e) {
                log.error("Daily sync failed for userId={}: {}", user.getId(), e.getMessage());
                // Continue with next user even if one fails
            }
        }

        log.info("Daily analytics sync complete");
    }

    // ========================================
    // GET ALL SNAPSHOTS FOR A USER
    // ========================================
    public List<AnalyticsSnapshotDTO> getUserSnapshots(Long userId) {
        return analyticsSnapshotRepository
                .findByUserIdOrderBySnapshotAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ========================================
    // GET SNAPSHOTS FOR ONE VIDEO (growth curve)
    // ========================================
    public List<AnalyticsSnapshotDTO> getVideoHistory(String tiktokVideoId) {
        return analyticsSnapshotRepository
                .findByTiktokVideoIdOrderBySnapshotAtAsc(tiktokVideoId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ========================================
    // GET VIDEO SUMMARIES — dashboard overview
    // ========================================
    public List<VideoSummaryDTO> getUserVideoSummaries(Long userId) {
        List<AnalyticsSnapshot> allSnapshots =
                analyticsSnapshotRepository.findByUserIdOrderBySnapshotAtDesc(userId);

        // Group by videoId, take latest snapshot + first snapshot for growth
        Map<String, List<AnalyticsSnapshot>> grouped = allSnapshots.stream()
                .collect(Collectors.groupingBy(AnalyticsSnapshot::getTiktokVideoId));

        return grouped.entrySet().stream()
                .map(entry -> {
                    List<AnalyticsSnapshot> snapshots = entry.getValue();
                    // Already sorted desc so index 0 = latest
                    AnalyticsSnapshot latest = snapshots.get(0);
                    AnalyticsSnapshot first = snapshots.get(snapshots.size() - 1);

                    long viewsGrowth = latest.getViews() - first.getViews();
                    float growthPct = first.getViews() > 0
                            ? (viewsGrowth * 100f) / first.getViews()
                            : 0f;

                    return VideoSummaryDTO.builder()
                            .tiktokVideoId(entry.getKey())
                            .coverImageUrl(latest.getCoverImageUrl())
                            .captionSnippet(latest.getCaptionSnippet())
                            .durationSeconds(latest.getDurationSeconds())
                            .latestViews(latest.getViews())
                            .latestLikes(latest.getLikes())
                            .latestComments(latest.getComments())
                            .latestShares(latest.getShares())
                            .latestEngagementRate(latest.getEngagementRate())
                            .viewsGrowth(viewsGrowth)
                            .growthPercentage(growthPct)
                            .build();
                })
                .sorted(Comparator.comparingLong(VideoSummaryDTO::getLatestViews).reversed())
                .collect(Collectors.toList());
    }

    // ========================================
    // GET TOP PERFORMING VIDEOS
    // ========================================
    public List<AnalyticsSnapshotDTO> getTopVideos(Long userId) {
        return analyticsSnapshotRepository
                .findTop10ByUserIdOrderByViewsDesc(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ========================================
    // FETCH VIDEOS FROM TIKTOK API
    // ========================================
    private List<JsonNode> fetchVideosFromTikTok(String accessToken) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String url = UriComponentsBuilder.fromUriString(VIDEO_LIST_URL)
                .queryParam("fields", "id,title,cover_image_url,video_description,duration,create_time,share_count,view_count,like_count,comment_count")
                .build()
                .toUriString();

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("max_count", 20);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

        JsonNode json = objectMapper.readTree(response.getBody());

        if (json.has("error") && json.get("error").has("code")) {
            String code = json.get("error").get("code").asText();
            if (!"ok".equalsIgnoreCase(code)) {
                throw new RuntimeException("TikTok video.list error: " +
                        json.get("error").get("message").asText());
            }
        }

        List<JsonNode> videos = new ArrayList<>();
        if (json.has("data") && json.get("data").has("videos")) {
            json.get("data").get("videos").forEach(videos::add);
        }
        return videos;
    }

    // ========================================
    // CREATE SNAPSHOT FROM VIDEO JSON
    // ========================================
    private void createSnapshot(User user, JsonNode video) {
        String videoId = video.has("id") ? video.get("id").asText() : null;
        if (videoId == null) return;

        Long views    = video.has("view_count")    ? video.get("view_count").asLong()    : 0L;
        Long likes    = video.has("like_count")    ? video.get("like_count").asLong()    : 0L;
        Long comments = video.has("comment_count") ? video.get("comment_count").asLong() : 0L;
        Long shares   = video.has("share_count")   ? video.get("share_count").asLong()   : 0L;

        float engagementRate = views > 0
                ? ((likes + comments + shares) * 100f) / views
                : 0f;

        String caption = video.has("video_description")
                ? video.get("video_description").asText() : "";
        String captionSnippet = caption.length() > 500
                ? caption.substring(0, 500) : caption;

        AnalyticsSnapshot snapshot = AnalyticsSnapshot.builder()
                .user(user)
                .tiktokVideoId(videoId)
                .coverImageUrl(video.has("cover_image_url") ? video.get("cover_image_url").asText() : null)
                .captionSnippet(captionSnippet)
                .durationSeconds(video.has("duration") ? video.get("duration").asInt() : null)
                .views(views)
                .likes(likes)
                .comments(comments)
                .shares(shares)
                .engagementRate(engagementRate)
                .snapshotAt(LocalDateTime.now())
                .build();

        analyticsSnapshotRepository.save(snapshot);
    }

    // ========================================
    // MAPPER
    // ========================================
    private AnalyticsSnapshotDTO toDTO(AnalyticsSnapshot s) {
        return AnalyticsSnapshotDTO.builder()
                .id(s.getId())
                .tiktokVideoId(s.getTiktokVideoId())
                .coverImageUrl(s.getCoverImageUrl())
                .captionSnippet(s.getCaptionSnippet())
                .durationSeconds(s.getDurationSeconds())
                .views(s.getViews())
                .likes(s.getLikes())
                .comments(s.getComments())
                .shares(s.getShares())
                .engagementRate(s.getEngagementRate())
                .snapshotAt(s.getSnapshotAt())
                .build();
    }
}
