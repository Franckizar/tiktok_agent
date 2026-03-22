package com.example.security.shared;

import com.example.security.UserRepository;
import com.example.security.Users.User;
import com.example.security.dto.response.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;

    // ========================================
    // GET CURRENT USER PROFILE BY EMAIL
    // ========================================
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(String email) {
        log.info("Fetching profile for email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        log.info("User found - ID: {}, Role: {}, Status: {}",
                user.getId(), user.getDefaultRole(), user.getStatus());

        return buildResponse(user);
    }

    // ========================================
    // GET USER PROFILE BY ID
    // ========================================
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfileById(Long userId) {
        log.info("Fetching profile for UserID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        log.info("User found - Email: {}, Role: {}", user.getEmail(), user.getDefaultRole());

        return buildResponse(user);
    }

    // ========================================
    // PRIVATE HELPER
    // ========================================
    private UserProfileResponse buildResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .role(user.getDefaultRole().name())
                .status(user.getStatus().name())
                .logoPath(user.getLogoPath())
                // Profile flags
                .hasPlayerProfile(user.getPlayerProfile() != null)
                .hasSuperAdminProfile(user.getSuperAdminProfile() != null)
                // TikTok profile
                .tiktokId(user.getTiktokId())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .tiktokBio(user.getTiktokBio())
                .tiktokProfileLink(user.getTiktokProfileLink())
                .tiktokConnected(user.isTiktokConnected())
                .tiktokVerified(user.isTiktokVerified())
                // TikTok stats
                .tiktokFollowerCount(user.getTiktokFollowerCount())
                .tiktokFollowingCount(user.getTiktokFollowingCount())
                .tiktokLikesCount(user.getTiktokLikesCount())
                .tiktokVideoCount(user.getTiktokVideoCount())
                .build();
    }
}