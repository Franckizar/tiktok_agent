package com.example.security.config;

import com.example.security.Users.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repository for managing email verification tokens
 */
@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    
    /**
     * Find token by its unique token string (UUID)
     * @param token The UUID token
     * @return Optional containing the token if found
     */
    Optional<EmailVerificationToken> findByToken(String token);
    
    /**
     * Find the latest unverified token for a specific user
     * Used when user requests a new verification code
     * @param userId The user's ID
     * @return Optional containing the token if found
     */
    @Query("SELECT evt FROM EmailVerificationToken evt WHERE evt.user.id = :userId AND evt.verified = false ORDER BY evt.createdAt DESC")
    Optional<EmailVerificationToken> findLatestUnverifiedByUserId(@Param("userId") Long userId);
    
    /**
     * Find the latest unverified token by email address
     * @param email User's email
     * @return Optional containing the token if found
     */
    @Query("SELECT evt FROM EmailVerificationToken evt WHERE evt.user.email = :email AND evt.verified = false ORDER BY evt.createdAt DESC")
    Optional<EmailVerificationToken> findLatestUnverifiedByEmail(@Param("email") String email);
    
    /**
     * Delete all expired tokens
     * Should be run by scheduled task
     * @param now Current timestamp
     */
    @Modifying
    @Query("DELETE FROM EmailVerificationToken evt WHERE evt.expiryDate < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);
    
    /**
     * Delete all tokens for a specific user
     * Used when user verifies email or account is deleted
     * @param userId The user's ID
     */
    @Modifying
    @Query("DELETE FROM EmailVerificationToken evt WHERE evt.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
    
    /**
     * Check if user has a verified token
     * @param userId The user's ID
     * @return true if user has verified their email
     */
    boolean existsByUserIdAndVerifiedTrue(Long userId);
    
    /**
     * Count how many unverified tokens exist for a user
     * Used to prevent spam
     * @param userId The user's ID
     * @return count of unverified tokens
     */
    @Query("SELECT COUNT(evt) FROM EmailVerificationToken evt WHERE evt.user.id = :userId AND evt.verified = false")
    long countUnverifiedByUserId(@Param("userId") Long userId);
}