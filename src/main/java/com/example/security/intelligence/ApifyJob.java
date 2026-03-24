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
@Table(name = "apify_jobs")
public class ApifyJob {

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
    // JOB DETAILS
    // ========================================

    @Column(name = "niche_keyword", nullable = false)
    private String nicheKeyword;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", length = 20)
    private JobStatus status = JobStatus.PENDING;

    @Column(name = "apify_run_id")
    private String apifyRunId;

    // Full raw JSON from Apify stored as TEXT
    @Column(name = "raw_result", columnDefinition = "LONGTEXT")
    private String rawResult;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    // ========================================
    // TIMESTAMPS
    // ========================================

    @Builder.Default
    @Column(name = "requested_at")
    private LocalDateTime requestedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // ========================================
    // ENUM
    // ========================================

    public enum JobStatus {
        PENDING, RUNNING, COMPLETED, FAILED
    }
}
