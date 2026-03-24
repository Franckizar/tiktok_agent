package com.example.security.analytics;

import com.example.security.Users.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "analytics_snapshots")
public class AnalyticsSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ========================================
    // USER RELATION
    // ========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ========================================
    // TIKTOK VIDEO IDENTITY
    // ========================================

    @Column(name = "tiktok_video_id", nullable = false)
    private String tiktokVideoId;

    @Column(name = "cover_image_url", columnDefinition = "TEXT")
    private String coverImageUrl;

    @Column(name = "caption_snippet", length = 500)
    private String captionSnippet;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    // ========================================
    // STATS SNAPSHOT
    // ========================================

    @Builder.Default
    @Column(name = "views")
    private Long views = 0L;

    @Builder.Default
    @Column(name = "likes")
    private Long likes = 0L;

    @Builder.Default
    @Column(name = "comments")
    private Long comments = 0L;

    @Builder.Default
    @Column(name = "shares")
    private Long shares = 0L;

    // Calculated: (likes + comments + shares) / views * 100
    @Column(name = "engagement_rate")
    private Float engagementRate;

    // ========================================
    // TIMESTAMP
    // ========================================

    @Builder.Default
    @Column(name = "snapshot_at")
    private LocalDateTime snapshotAt = LocalDateTime.now();
}
