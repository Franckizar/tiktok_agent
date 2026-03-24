package com.example.security.intelligence;

import com.example.security.Users.User;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "niche_reports")
public class NicheReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ========================================
    // RELATIONS
    // ========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apify_job_id", nullable = false)
    private ApifyJob apifyJob;

    // ========================================
    // REPORT IDENTITY
    // ========================================

    @Column(name = "niche", nullable = false)
    private String niche;

    // ========================================
    // AI-GENERATED CONTENT
    // ========================================

    // Full AI-written strategy overview paragraph
    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    // JSON array: [{"format":"duet","score":92},{"format":"voiceover","score":87}]
    @Column(name = "top_formats", columnDefinition = "JSON")
    private String topFormats;

    // JSON array: [{"time":"19:00","engagement":8.4},{"time":"08:00","engagement":7.1}]
    @Column(name = "best_posting_times", columnDefinition = "JSON")
    private String bestPostingTimes;

    // JSON array: [{"hashtag":"#fyp","avgViews":120000},{"hashtag":"#sneakers","avgViews":85000}]
    @Column(name = "top_hashtags", columnDefinition = "JSON")
    private String topHashtags;

    // AI summary of the competitor landscape in this niche
    @Column(name = "competitor_insights", columnDefinition = "TEXT")
    private String competitorInsights;

    // Step by step growth strategy from AI
    @Column(name = "growth_strategy", columnDefinition = "TEXT")
    private String growthStrategy;

    // ========================================
    // TIMESTAMP
    // ========================================

    @Builder.Default
    @Column(name = "generated_at")
    private LocalDateTime generatedAt = LocalDateTime.now();
}
