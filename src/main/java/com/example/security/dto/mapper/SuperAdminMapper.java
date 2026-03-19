package com.example.security.dto.mapper;

import com.example.security.Users.SuperAdmin.SuperAdmin;
import com.example.security.dto.response.SuperAdminResponse;
import org.springframework.stereotype.Component;

@Component
public class SuperAdminMapper {

    public SuperAdminResponse toResponse(SuperAdmin superAdmin) {
        return SuperAdminResponse.builder()
                .id(superAdmin.getId())
                .userId(superAdmin.getUser().getId())
                // User info
                .email(superAdmin.getUser().getEmail())
                .firstname(superAdmin.getUser().getFirstname())
                .lastname(superAdmin.getUser().getLastname())
                // System info
                .systemName(superAdmin.getSystemName())
                .contactEmail(superAdmin.getContactEmail())
                .contactPhone(superAdmin.getContactPhone())
                // Audit
                .createdAt(superAdmin.getCreatedAt())
                .lastLoginAt(superAdmin.getLastLoginAt())
                // Status
                .active(superAdmin.isActive())
                .build();
    }
}