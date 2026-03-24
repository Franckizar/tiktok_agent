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
@Table(name = "scheduled_posts")
public class ScheduledPost {

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
    // POST CONTENT
    // ========================================

    @Column(name = "title")
    private String title;

    @Column(name = "caption", columnDefinition = "TEXT")
    private String caption;

    @Column(name = "hashtags", columnDefinition = "TEXT")
    private String hashtags;

    @Column(name = "video_file_path", columnDefinition = "TEXT")
    private String videoFilePath;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "privacy_level", length = 20)
    private PrivacyLevel privacyLevel = PrivacyLevel.PUBLIC;

    // ========================================
    // SCHEDULING
    // ========================================

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", length = 20)
    private PostStatus status = PostStatus.PENDING;

    // ========================================
    // TIKTOK PUBLISH RESULT
    // ========================================

    @Column(name = "tiktok_publish_id")
    private String tiktokPublishId;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Builder.Default
    @Column(name = "retry_count")
    private Integer retryCount = 0;

    // ========================================
    // TIMESTAMPS
    // ========================================

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ========================================
    // ENUMS
    // ========================================

    public enum PostStatus {
        PENDING, PUBLISHING, PUBLISHED, FAILED, CANCELLED
    }

    public enum PrivacyLevel {
        PUBLIC, FRIENDS, PRIVATE
    }
}
