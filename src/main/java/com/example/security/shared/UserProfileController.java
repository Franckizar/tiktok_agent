package com.example.security.shared;

import com.example.security.dto.response.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/shared") // ✅ CHANGED: /user → /shared
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    /**
     * Get current authenticated user's profile
     * Accessible by ANY authenticated user (USER, ADMIN, EDITOR, ROLE_1, etc.)
     */
    @GetMapping("/profile/me")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile(Authentication authentication) {
        log.info("=== GET CURRENT USER PROFILE ===");
        log.info("Authenticated user: {}", authentication.getName());

        try {
            String email = authentication.getName();
            UserProfileResponse profile = userProfileService.getCurrentUserProfile(email);

            log.info("Profile retrieved successfully for: {}", email);
            log.info("=== PROFILE REQUEST COMPLETE ===");

            return ResponseEntity.ok(profile);

        } catch (Exception e) {
            log.error("Failed to get user profile: {}", e.getMessage(), e);
            log.info("=== PROFILE REQUEST FAILED ===");
            throw e;
        }
    }

    /**
     * Get any user's profile by ID
     * Accessible by ANY authenticated user
     */
    @GetMapping("/profile/{userId}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long userId) {
        log.info("=== GET USER PROFILE BY ID ===");
        log.info("Requested UserID: {}", userId);

        try {
            UserProfileResponse profile = userProfileService.getUserProfileById(userId);

            log.info("Profile retrieved successfully for UserID: {}", userId);
            log.info("=== PROFILE REQUEST COMPLETE ===");

            return ResponseEntity.ok(profile);

        } catch (Exception e) {
            log.error("Failed to get user profile: {}", e.getMessage(), e);
            log.info("=== PROFILE REQUEST FAILED ===");
            throw e;
        }
    }
}