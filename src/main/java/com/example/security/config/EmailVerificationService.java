package com.example.security.config;


import com.example.security.UserRepository;
import com.example.security.Users.EmailVerificationToken;
import com.example.security.Users.Role;
import com.example.security.Users.User;
import com.example.security.Users.UserStatus;
import com.example.security.config.EmailService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for handling email verification with OTP codes
 */
@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailVerificationService.class);
    private static final SecureRandom RANDOM = new SecureRandom();
    
    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${system.registration.mode:CLOSED}")
    private String registrationMode;

    @Value("${system.default.role:ROLE_1}")
    private String defaultRoleName;

    // ========================================
    // CREATE AND SEND VERIFICATION CODE
    // ========================================
    
    /**
     * Create verification token and send email to user
     * Called during registration
     * 
     * @param user The newly registered user
     * @return The generated verification code (for logging/testing only)
     */
    @Transactional
    public String createAndSendVerificationCode(User user) {
        log.info("Creating verification code for user: {}", user.getEmail());

        try {
            // Delete any existing unverified tokens for this user
            tokenRepository.deleteByUserId(user.getId());
            log.debug("Deleted old verification tokens for user: {}", user.getId());

            // Generate 6-digit code
            String verificationCode = generateSixDigitCode();
            String token = UUID.randomUUID().toString();

            // Create token entity
            EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                    .token(token)
                    .verificationCode(verificationCode)
                    .user(user)
                    .expiryDate(LocalDateTime.now().plusMinutes(15))
                    .verified(false)
                    .attemptCount(0)
                    .maxAttempts(5)
                    .build();

            tokenRepository.save(verificationToken);
            log.info("✅ Verification token created - Code: {} (expires in 15 min)", verificationCode);

            // Send email
            emailService.sendVerificationEmail(
                    user.getEmail(),
                    verificationCode,
                    user.getFirstname()
            );
            log.info("📧 Verification email sent to: {}", user.getEmail());

            return verificationCode; // For logging purposes only

        } catch (Exception e) {
            log.error("Failed to create verification code for user: {}", user.getEmail(), e);
            throw new RuntimeException("Failed to send verification email", e);
        }
    }

    // ========================================
    // VERIFY EMAIL WITH CODE
    // ========================================
    
    /**
     * Verify user's email with the provided code
     * Updates user status from UNVERIFIED to PENDING or ACTIVE
     * 
     * @param email User's email
     * @param code 6-digit verification code
     * @return Success message
     */
    @Transactional
    public String verifyEmail(String email, String code) {
        log.info("=== EMAIL VERIFICATION ATTEMPT ===");
        log.info("Email: {}, Code: {}", email, code);

        try {
            // Find user
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        log.warn("Verification failed - user not found: {}", email);
                        return new UsernameNotFoundException("User not found");
                    });

            // Check if already verified
            if (user.getStatus() != UserStatus.UNVERIFIED) {
                log.warn("User already verified or not in UNVERIFIED status: {} (status: {})", 
                        email, user.getStatus());
                throw new IllegalStateException("Email already verified or account not in verification state");
            }

            // Find latest verification token
            EmailVerificationToken token = tokenRepository
                    .findLatestUnverifiedByUserId(user.getId())
                    .orElseThrow(() -> {
                        log.warn("No verification token found for user: {}", email);
                        return new IllegalStateException("No verification code found. Please request a new one.");
                    });

            // Check if token is expired
            if (token.isExpired()) {
                log.warn("Verification token expired for user: {}", email);
                throw new IllegalStateException("Verification code expired. Please request a new one.");
            }

            // Check if max attempts exceeded
            if (token.hasExceededMaxAttempts()) {
                log.warn("Max verification attempts exceeded for user: {}", email);
                throw new IllegalStateException("Maximum verification attempts exceeded. Please request a new code.");
            }

            // Verify the code
            if (!token.getVerificationCode().equals(code)) {
                // Increment attempt counter
                token.incrementAttempt();
                tokenRepository.save(token);
                
                int remainingAttempts = token.getRemainingAttempts();
                log.warn("Invalid verification code for user: {} - Remaining attempts: {}", 
                        email, remainingAttempts);
                
                if (remainingAttempts > 0) {
                    throw new IllegalArgumentException(
                            "Invalid verification code. " + remainingAttempts + " attempts remaining."
                    );
                } else {
                    throw new IllegalStateException(
                            "Invalid verification code. Maximum attempts exceeded. Please request a new code."
                    );
                }
            }

            // ✅ CODE IS CORRECT - VERIFY USER
            log.info("✅ Verification code correct for user: {}", email);

            // Mark token as verified
            token.setVerified(true);
            tokenRepository.save(token);

            // Update user status based on registration mode
            UserStatus newStatus;
            Role newRole;

            if ("OPEN".equalsIgnoreCase(registrationMode)) {
                // Open registration - activate immediately
                newStatus = UserStatus.ACTIVE;
                newRole = Role.valueOf(defaultRoleName);
                user.setDefaultRole(newRole);
                user.getRoles().clear();
                user.addRole(newRole);
                
                log.info("🎉 OPEN REGISTRATION - User activated: {} with role: {}", email, newRole);
            } else {
                // Closed registration - pending admin approval
                newStatus = UserStatus.PENDING;
                newRole = Role.UNREG;
                
                log.info("📋 CLOSED REGISTRATION - User pending admin approval: {}", email);
            }

            user.setStatus(newStatus);
            userRepository.save(user);

            log.info("=== EMAIL VERIFICATION SUCCESSFUL ===");
            log.info("User: {}, New Status: {}, Role: {}", email, newStatus, newRole);

            // Clean up old tokens
            tokenRepository.deleteByUserId(user.getId());

            if (newStatus == UserStatus.ACTIVE) {
                return "Email verified successfully! You can now log in.";
            } else {
                return "Email verified successfully! Your account is pending admin approval.";
            }

        } catch (UsernameNotFoundException | IllegalStateException | IllegalArgumentException e) {
            log.error("Verification failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during verification for email: {}", email, e);
            throw new RuntimeException("Verification failed due to server error", e);
        }
    }

    // ========================================
    // RESEND VERIFICATION CODE
    // ========================================
    
    /**
     * Resend verification code to user
     * Invalidates old code and creates new one
     * 
     * @param email User's email
     * @return Success message
     */
    @Transactional
    public String resendVerificationCode(String email) {
        log.info("=== RESEND VERIFICATION CODE REQUEST ===");
        log.info("Email: {}", email);

        try {
            // Find user
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        log.warn("Resend failed - user not found: {}", email);
                        return new UsernameNotFoundException("User not found");
                    });

            // Check user status
            if (user.getStatus() != UserStatus.UNVERIFIED) {
                log.warn("Resend failed - user not in UNVERIFIED status: {} (status: {})", 
                        email, user.getStatus());
                throw new IllegalStateException("Email already verified or account not in verification state");
            }

            // Check rate limiting - prevent spam
            long unverifiedTokenCount = tokenRepository.countUnverifiedByUserId(user.getId());
            if (unverifiedTokenCount > 0) {
                Optional<EmailVerificationToken> latestToken = 
                        tokenRepository.findLatestUnverifiedByUserId(user.getId());
                
                if (latestToken.isPresent()) {
                    LocalDateTime lastCreated = latestToken.get().getCreatedAt();
                    LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
                    
                    if (lastCreated.isAfter(oneMinuteAgo)) {
                        log.warn("Rate limit: User {} requested code too soon", email);
                        throw new IllegalStateException(
                                "Please wait at least 1 minute before requesting a new code"
                        );
                    }
                }
            }

            // Delete old tokens
            tokenRepository.deleteByUserId(user.getId());
            log.debug("Deleted old verification tokens for user: {}", user.getId());

            // Generate new code
            String newCode = generateSixDigitCode();
            String newToken = UUID.randomUUID().toString();

            EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                    .token(newToken)
                    .verificationCode(newCode)
                    .user(user)
                    .expiryDate(LocalDateTime.now().plusMinutes(15))
                    .verified(false)
                    .attemptCount(0)
                    .maxAttempts(5)
                    .build();

            tokenRepository.save(verificationToken);
            log.info("✅ New verification code created: {} (expires in 15 min)", newCode);

            // Send email
            emailService.sendVerificationCodeResend(
                    user.getEmail(),
                    newCode,
                    user.getFirstname()
            );
            log.info("📧 Verification code resent to: {}", email);
            log.info("=== RESEND COMPLETE ===");

            return "Verification code sent successfully! Please check your email.";

        } catch (UsernameNotFoundException | IllegalStateException e) {
            log.error("Resend failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during resend for email: {}", email, e);
            throw new RuntimeException("Failed to resend verification code", e);
        }
    }

    // ========================================
    // SCHEDULED CLEANUP TASKS
    // ========================================
    
    /**
     * Delete expired verification tokens
     * Runs every hour
     */
    @Scheduled(cron = "0 0 * * * *") // Every hour at :00
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Running scheduled cleanup of expired verification tokens");
        
        try {
            tokenRepository.deleteExpiredTokens(LocalDateTime.now());
            log.info("✅ Expired verification tokens cleaned up");
        } catch (Exception e) {
            log.error("Failed to cleanup expired tokens", e);
        }
    }

    /**
     * Delete unverified users older than 24 hours
     * Runs every day at 3 AM
     */
    @Scheduled(cron = "0 0 3 * * *") // Every day at 3 AM
    @Transactional
    public void cleanupUnverifiedUsers() {
        log.info("Running scheduled cleanup of unverified users");
        
        try {
            LocalDateTime cutoffTime = LocalDateTime.now().minusHours(24);
            List<User> unverifiedUsers = userRepository.findByStatus(UserStatus.UNVERIFIED);
            
            int deletedCount = 0;
            for (User user : unverifiedUsers) {
                // Check if user was created more than 24 hours ago
                // Note: You may need to add a 'createdAt' field to User entity
                // For now, we'll just log
                log.info("Found unverified user: {} (ID: {})", user.getEmail(), user.getId());
                // TODO: Add actual deletion logic when User has createdAt timestamp
            }
            
            log.info("✅ Unverified users cleanup complete - Found: {}", unverifiedUsers.size());
        } catch (Exception e) {
            log.error("Failed to cleanup unverified users", e);
        }
    }

    // ========================================
    // HELPER METHODS
    // ========================================
    
    /**
     * Generate random 6-digit code
     * @return 6-digit string (e.g., "847293")
     */
    private String generateSixDigitCode() {
        int code = 100000 + RANDOM.nextInt(900000); // Range: 100000-999999
        return String.valueOf(code);
    }
}