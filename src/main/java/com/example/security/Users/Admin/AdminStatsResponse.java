package com.example.security.Users.Admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AdminStatsResponse - Statistics about admin users
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private Long totalAdmins;
    private Long superAdmins;
    private Long regularAdmins;

    public Double getSuperAdminPercentage() {
        if (totalAdmins == null || totalAdmins == 0) {
            return 0.0;
        }
        return (superAdmins * 100.0) / totalAdmins;
    }
}