package com.example.security.Users.Admin;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCreateRequest {
    @NotNull(message = "User ID is required")
    @Positive(message = "User ID must be positive")
    private Integer userId;

    private String favoriteColor;
    private Integer luckyNumber;
    private Boolean isSuperAdmin;
    private String notes;
}