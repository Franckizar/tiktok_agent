package com.example.security.scheduling;

import com.example.security.config.JwtService;
import com.example.security.scheduling.dto.PostHistoryDTO;
import com.example.security.scheduling.dto.SchedulePostRequest;
import com.example.security.scheduling.dto.ScheduledPostDTO;

// import com.example.security.scheduling.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/player/scheduling")
@RequiredArgsConstructor
public class SchedulingController {

    private final SchedulingService schedulingService;
    private final JwtService jwtService;

    // Schedule a new post
    @PostMapping
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<ScheduledPostDTO> schedulePost(
            @RequestBody SchedulePostRequest request,
            HttpServletRequest httpRequest) {
        Long userId = jwtService.extractUserIdFromRequest(httpRequest);
        return ResponseEntity.ok(schedulingService.schedulePost(userId, request));
    }

    // Cancel a scheduled post
    @DeleteMapping("/{postId}")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<String> cancelPost(
            @PathVariable Long postId,
            HttpServletRequest request) {
        Long userId = jwtService.extractUserIdFromRequest(request);
        schedulingService.cancelPost(userId, postId);
        return ResponseEntity.ok("Post cancelled");
    }

    // Get all scheduled posts for logged-in user
    @GetMapping
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<List<ScheduledPostDTO>> getScheduledPosts(HttpServletRequest request) {
        Long userId = jwtService.extractUserIdFromRequest(request);
        return ResponseEntity.ok(schedulingService.getUserScheduledPosts(userId));
    }

    // Get post history
    @GetMapping("/history")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<List<PostHistoryDTO>> getHistory(HttpServletRequest request) {
        Long userId = jwtService.extractUserIdFromRequest(request);
        return ResponseEntity.ok(schedulingService.getUserPostHistory(userId));
    }
}
