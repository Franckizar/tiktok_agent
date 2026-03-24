package com.example.security.intelligence;

import com.example.security.config.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/player/intelligence")
@RequiredArgsConstructor
public class IntelligenceController {

    private final IntelligenceService intelligenceService;
    private final JwtService jwtService;

    // Trigger a new niche analysis — returns immediately, runs async
    @PostMapping("/analyze")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<ApifyJob> triggerAnalysis(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        Long userId = jwtService.extractUserIdFromRequest(request);
        String keyword = body.get("nicheKeyword");
        return ResponseEntity.ok(intelligenceService.triggerNicheAnalysis(userId, keyword));
    }

    // Get all analysis jobs for logged-in user
    @GetMapping("/jobs")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<List<ApifyJob>> getJobs(HttpServletRequest request) {
        Long userId = jwtService.extractUserIdFromRequest(request);
        return ResponseEntity.ok(intelligenceService.getUserJobs(userId));
    }

    // Get hashtag trends for a specific job
    @GetMapping("/jobs/{jobId}/hashtags")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<List<HashtagTrend>> getHashtags(@PathVariable Long jobId) {
        return ResponseEntity.ok(intelligenceService.getJobHashtags(jobId));
    }

    // Get competitor profiles for a specific job
    @GetMapping("/jobs/{jobId}/competitors")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<List<CompetitorProfile>> getCompetitors(@PathVariable Long jobId) {
        return ResponseEntity.ok(intelligenceService.getJobCompetitors(jobId));
    }

    // Get niche report for a specific job
    @GetMapping("/jobs/{jobId}/report")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<?> getReport(@PathVariable Long jobId) {
        return intelligenceService.getReportByJobId(jobId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get all reports for logged-in user
    @GetMapping("/reports")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<List<NicheReport>> getReports(HttpServletRequest request) {
        Long userId = jwtService.extractUserIdFromRequest(request);
        return ResponseEntity.ok(intelligenceService.getUserReports(userId));
    }

    // Get all AI suggestions for logged-in user
    @GetMapping("/suggestions")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<List<AiSuggestion>> getSuggestions(HttpServletRequest request) {
        Long userId = jwtService.extractUserIdFromRequest(request);
        return ResponseEntity.ok(intelligenceService.getUserSuggestions(userId));
    }
}
