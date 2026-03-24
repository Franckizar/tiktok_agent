package com.example.security.intelligence;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "competitor_profiles")
public class CompetitorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ========================================
    // JOB RELATION
    // ========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apify_job_id", nullable = false)
    private ApifyJob apifyJob;

    // ========================================
    // COMPETITOR IDENTITY
    // ========================================

    @Column(name = "tiktok_handle")
    private String tiktokHandle;

    @Column(name = "display_name")
    private String displayName;

    // ========================================
    // COMPETITOR STATS
    // ========================================

    @Builder.Default
    @Column(name = "follower_count")
    private Long followerCount = 0L;

    @Builder.Default
    @Column(name = "avg_views")
    private Long avgViews = 0L;

    @Builder.Default
    @Column(name = "avg_likes")
    private Long avgLikes = 0L;

    @Column(name = "avg_engagement")
    private Float avgEngagement;

    // ========================================
    // CONTENT PATTERNS
    // ========================================

    // Comma-separated list e.g. "#fyp,#sneakers,#cameroon"
    @Column(name = "top_hashtags", columnDefinition = "TEXT")
    private String topHashtags;

    // e.g. "2x per day", "5x per week"
    @Column(name = "posting_frequency", length = 100)
    private String postingFrequency;

    // e.g. "08:00,12:00,20:00"
    @Column(name = "best_posting_times", columnDefinition = "TEXT")
    private String bestPostingTimes;

    // e.g. "duet,stitch,voiceover,trending sound"
    @Column(name = "content_formats", columnDefinition = "TEXT")
    private String contentFormats;

    // ========================================
    // TIMESTAMP
    // ========================================

    @Builder.Default
    @Column(name = "captured_at")
    private LocalDateTime capturedAt = LocalDateTime.now();
}
