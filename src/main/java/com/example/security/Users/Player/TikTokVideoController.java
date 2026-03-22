package com.example.security.Users.Player;

import com.example.security.UserRepository;
import com.example.security.Users.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/player/tiktok")
@RequiredArgsConstructor
public class TikTokVideoController {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String VIDEO_LIST_URL = "https://open.tiktokapis.com/v2/video/list/";

    @GetMapping("/videos")
    public ResponseEntity<?> getUserVideos(Authentication authentication) {
        log.info("=== FETCH TIKTOK VIDEOS ===");

        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            if (!user.isTiktokConnected() || user.getTiktokAccessToken() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "TikTok not connected"));
            }

            // Call TikTok video list API
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + user.getTiktokAccessToken());
            headers.setContentType(MediaType.APPLICATION_JSON);

            String url = VIDEO_LIST_URL +
                "?fields=id,title,cover_image_url,video_description,duration," +
                "like_count,comment_count,share_count,view_count,create_time";

            String body = "{\"max_count\": 20}";

            HttpEntity<String> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, request, String.class);

            log.info("TikTok video list response: {}", response.getStatusCode());

            JsonNode json = objectMapper.readTree(response.getBody());

            if (json.has("error") && json.get("error").has("code")) {
                String errorCode = json.get("error").get("code").asText();
                if (!"ok".equalsIgnoreCase(errorCode)) {
                    String errorMsg = json.get("error").get("message").asText();
                    log.error("TikTok API error: {}", errorMsg);
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", errorMsg));
                }
            }

            JsonNode videos = json.path("data").path("videos");
            List<Map<String, Object>> videoList = new ArrayList<>();

            if (videos.isArray()) {
                for (JsonNode video : videos) {
                    Map<String, Object> v = new java.util.HashMap<>();
                    v.put("id", video.path("id").asText());
                    v.put("title", video.path("title").asText());
                    v.put("coverImageUrl", video.path("cover_image_url").asText());
                    v.put("description", video.path("video_description").asText());
                    v.put("duration", video.path("duration").asInt());
                    v.put("likeCount", video.path("like_count").asLong());
                    v.put("commentCount", video.path("comment_count").asLong());
                    v.put("shareCount", video.path("share_count").asLong());
                    v.put("viewCount", video.path("view_count").asLong());
                    v.put("createTime", video.path("create_time").asLong());
                    videoList.add(v);
                }
            }

            log.info("Returning {} videos", videoList.size());
            return ResponseEntity.ok(Map.of("videos", videoList));

        } catch (Exception e) {
            log.error("Failed to fetch TikTok videos: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch videos"));
        }
    }
}