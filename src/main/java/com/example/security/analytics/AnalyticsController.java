package com.example.security.analytics;

import com.example.security.analytics.dto.AnalyticsSnapshotDTO;
import com.example.security.analytics.dto.VideoSummaryDTO;
import com.example.security.config.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/player/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final JwtService jwtService;

    // Trigger manual sync for logged-in user
    @PostMapping("/sync")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<String> syncVideos(HttpServletRequest request) {
        Long userId = jwtService.extractUserIdFromRequest(request);
        analyticsService.syncUserVideos(userId);
        return ResponseEntity.ok("Sync complete");
    }

    // Dashboard overview — one card per video
    @GetMapping("/summaries")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<List<VideoSummaryDTO>> getSummaries(HttpServletRequest request) {
        Long userId = jwtService.extractUserIdFromRequest(request);
        return ResponseEntity.ok(analyticsService.getUserVideoSummaries(userId));
    }

    // Full snapshot history for one video (for growth chart)
    @GetMapping("/video/{tiktokVideoId}/history")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<List<AnalyticsSnapshotDTO>> getVideoHistory(
            @PathVariable String tiktokVideoId) {
        return ResponseEntity.ok(analyticsService.getVideoHistory(tiktokVideoId));
    }

    // Top 10 videos by views
    @GetMapping("/top")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<List<AnalyticsSnapshotDTO>> getTopVideos(HttpServletRequest request) {
        Long userId = jwtService.extractUserIdFromRequest(request);
        return ResponseEntity.ok(analyticsService.getTopVideos(userId));
    }
}
