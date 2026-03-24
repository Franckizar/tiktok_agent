package com.example.security.scheduling;

import com.example.security.Users.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "post_history")
public class PostHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ========================================
    // RELATIONS
    // ========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Nullable — manual posts (not via scheduler) have no scheduled_post
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scheduled_post_id")
    private ScheduledPost scheduledPost;

    // ========================================
    // TIKTOK DATA
    // ========================================

    @Column(name = "tiktok_video_id")
    private String tiktokVideoId;

    @Column(name = "caption", columnDefinition = "TEXT")
    private String caption;

    @Column(name = "hashtags", columnDefinition = "TEXT")
    private String hashtags;

    @Column(name = "posted_at")
    private LocalDateTime postedAt;

    // ========================================
    // STATS AT TIME OF POSTING
    // ========================================

    @Builder.Default
    @Column(name = "views_at_post")
    private Long viewsAtPost = 0L;

    @Builder.Default
    @Column(name = "likes_at_post")
    private Long likesAtPost = 0L;

    @Builder.Default
    @Column(name = "comments_at_post")
    private Long commentsAtPost = 0L;

    @Builder.Default
    @Column(name = "shares_at_post")
    private Long sharesAtPost = 0L;

    // ========================================
    // SOURCE
    // ========================================

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "source", length = 20)
    private PostSource source = PostSource.SCHEDULED;

    public enum PostSource {
        SCHEDULED,  // Posted via your scheduler
        MANUAL      // Posted directly on TikTok, synced via video.list
    }
}
