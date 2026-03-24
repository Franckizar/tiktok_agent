package com.example.security.intelligence;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "hashtag_trends")
public class HashtagTrend {

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
    // HASHTAG DATA
    // ========================================

    @Column(name = "hashtag", nullable = false)
    private String hashtag;

    @Builder.Default
    @Column(name = "video_count")
    private Long videoCount = 0L;

    @Builder.Default
    @Column(name = "avg_views")
    private Long avgViews = 0L;

    @Builder.Default
    @Column(name = "avg_likes")
    private Long avgLikes = 0L;

    @Builder.Default
    @Column(name = "avg_shares")
    private Long avgShares = 0L;

    @Column(name = "engagement_rate")
    private Float engagementRate;

    @Column(name = "region", length = 100)
    private String region;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "trend_direction", length = 20)
    private TrendDirection trendDirection = TrendDirection.STABLE;

    // ========================================
    // TIMESTAMP
    // ========================================

    @Builder.Default
    @Column(name = "captured_at")
    private LocalDateTime capturedAt = LocalDateTime.now();

    // ========================================
    // ENUM
    // ========================================

    public enum TrendDirection {
        RISING, STABLE, DECLINING
    }
}
