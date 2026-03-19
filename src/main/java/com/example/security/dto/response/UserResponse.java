package com.example.security.dto.response;

import com.example.security.Users.Role;
import com.example.security.Users.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    // ✅ Core user fields
    private Long id;
    private String firstname;
    private String lastname;
    private String email;
    private java.util.List<Role> roles;
    private Role defaultRole;
    private UserStatus status;

    // ✅ UPDATED: Player profile (replaces user1ProfileId)
    private Long playerProfileId;
    private boolean hasPlayerProfile;

    // ✅ NEW: SuperAdmin profile
    private Long superAdminProfileId;
    private boolean hasSuperAdminProfile;

    // ❌ NO password, tokenVersion, refreshTokens, subscription info
}