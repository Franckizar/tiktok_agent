package com.example.security.Users;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity for storing email verification codes
 * - Stores 6-digit verification code
 * - Expires after 15 minutes
 * - Max 5 attempts to prevent brute force
 * - One token per user at a time
 */
@Entity
@Table(name = "email_verification_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Unique token identifier (UUID)
     * Used for internal tracking
     */
    @Column(nullable = false, unique = true, length = 36)
    private String token;
    
    /**
     * 6-digit verification code sent to user's email
     * Example: "123456"
     */
    @Column(nullable = false, length = 6, name = "verification_code")
    private String verificationCode;
    
    /**
     * Reference to the user who needs to verify their email
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    /**
     * When this token expires (15 minutes from creation)
     */
    @Column(nullable = false, name = "expiry_date")
    private LocalDateTime expiryDate;
    
    /**
     * Whether this code has been successfully verified
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean verified = false;
    
    /**
     * How many times user has tried to verify with wrong code
     * Max: 5 attempts
     */
    @Column(nullable = false, name = "attempt_count")
    @Builder.Default
    private int attemptCount = 0;
    
    /**
     * Maximum allowed verification attempts
     */
    @Column(nullable = false, name = "max_attempts")
    @Builder.Default
    private int maxAttempts = 5;
    
    /**
     * When this token was created
     */
    @Column(nullable = false, name = "created_at")
    private LocalDateTime createdAt;
    
    /**
     * Automatically set creation time and expiry when entity is created
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (expiryDate == null) {
            // Token expires 15 minutes after creation
            expiryDate = LocalDateTime.now().plusMinutes(15);
        }
    }
    
    /**
     * Check if this token has expired
     * @return true if current time is past expiry date
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }
    
    /**
     * Check if user has used all verification attempts
     * @return true if attempt count >= max attempts
     */
    public boolean hasExceededMaxAttempts() {
        return attemptCount >= maxAttempts;
    }
    
    /**
     * Increment the attempt counter
     * Should be called each time user tries to verify with wrong code
     */
    public void incrementAttempt() {
        this.attemptCount++;
    }
    
    /**
     * Get remaining attempts
     * @return number of attempts left
     */
    public int getRemainingAttempts() {
        return Math.max(0, maxAttempts - attemptCount);
    }
    
    /**
     * Check if token is still valid for verification
     * @return true if not expired, not verified, and has attempts left
     */
    public boolean isValid() {
        return !isExpired() && !verified && !hasExceededMaxAttempts();
    }
}