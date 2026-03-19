package com.example.security.dto.emailverification;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for resending verification code
 * Used in POST /api/v1/auth/resend-verification
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResendVerificationRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
}