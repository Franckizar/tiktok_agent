package com.example.security.dto.emailverification;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for verifying email with 6-digit code
 * Used in POST /api/v1/auth/verify-email
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Verification code is required")
    @Size(min = 6, max = 6, message = "Verification code must be exactly 6 digits")
    @Pattern(regexp = "\\d{6}", message = "Verification code must contain only digits")
    private String code;
}