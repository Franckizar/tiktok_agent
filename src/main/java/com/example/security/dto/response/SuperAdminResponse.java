package com.example.security.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuperAdminResponse {

    private Long id;
    private Long userId;

    // User info
    private String email;
    private String firstname;
    private String lastname;

    // System info
    private String systemName;
    private String contactEmail;
    private String contactPhone;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;

    // Status
    private boolean active;
}