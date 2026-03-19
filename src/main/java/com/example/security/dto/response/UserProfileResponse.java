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

    // Profile flags - frontend uses these to know which dashboard to load
    private boolean hasPlayerProfile;
    private boolean hasSuperAdminProfile;
}