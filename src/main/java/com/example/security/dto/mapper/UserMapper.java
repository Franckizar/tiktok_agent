package com.example.security.dto.mapper;

import com.example.security.Users.User;
import com.example.security.dto.response.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }

        return UserResponse.builder()
                .id(user.getId())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .roles(user.getRoles())
                .defaultRole(user.getDefaultRole())
                .status(user.getStatus())
                // ✅ UPDATED: Player profile (replaces user1Profile)
                .playerProfileId(user.getPlayerProfile() != null ? user.getPlayerProfile().getId() : null)
                .hasPlayerProfile(user.getPlayerProfile() != null)
                // ✅ NEW: SuperAdmin profile
                .superAdminProfileId(user.getSuperAdminProfile() != null ? user.getSuperAdminProfile().getId() : null)
                .hasSuperAdminProfile(user.getSuperAdminProfile() != null)
                .build();
        // Notice: NO password, tokenVersion, refreshTokens!
    }
}