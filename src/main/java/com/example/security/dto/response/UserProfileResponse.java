package com.example.security.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String email;
    private String firstname;
    private String lastname;
    private String role;
    private String status;
    private String logoPath;

    // Profile flags
    private boolean hasPlayerProfile;
    private boolean hasSuperAdminProfile;

    // ========================================
    // TIKTOK PROFILE FIELDS
    // ========================================
    private String tiktokId;
    private String displayName;
    private String avatarUrl;
    private String tiktokBio;
    private String tiktokProfileLink;
    private boolean tiktokConnected;
    private boolean tiktokVerified;

    // ========================================
    // TIKTOK STATS
    // ========================================
    private Long tiktokFollowerCount;
    private Long tiktokFollowingCount;
    private Long tiktokLikesCount;
    private Long tiktokVideoCount;
}