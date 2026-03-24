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
@Table(name = "ai_suggestions")
public class AiSuggestion {

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
    // SUGGESTION CONTENT
    // ========================================

    @Enumerated(EnumType.STRING)
    @Column(name = "suggestion_type", length = 30)
    private SuggestionType suggestionType;

    // The actual suggestion text from AI
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    // Filled when type = HASHTAG
    @Column(name = "recommended_hashtags", columnDefinition = "TEXT")
    private String recommendedHashtags;

    // Filled when type = POSTING_TIME e.g. "08:00, 19:00, 21:00"
    @Column(name = "recommended_times", columnDefinition = "TEXT")
    private String recommendedTimes;

    // Why the AI made this suggestion
    @Column(name = "reasoning", columnDefinition = "TEXT")
    private String reasoning;

    // 0.0 to 1.0
    @Column(name = "confidence_score")
    private Float confidenceScore;

    // Did the creator actually use this suggestion
    @Builder.Default
    @Column(name = "is_applied")
    private boolean isApplied = false;

    // ========================================
    // TIMESTAMP
    // ========================================

    @Builder.Default
    @Column(name = "generated_at")
    private LocalDateTime generatedAt = LocalDateTime.now();

    // ========================================
    // ENUM
    // ========================================

    public enum SuggestionType {
        HASHTAG,
        POSTING_TIME,
        FORMAT,
        CAPTION_STYLE,
        HOOK,
        TREND
    }
}
