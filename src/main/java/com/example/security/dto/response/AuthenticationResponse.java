package com.example.security.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {

    // ✅ User info (returned when using cookies)
    private String email;
    private String role;
    private String message;  // ✅ ADDED: For success/info messages
    
    // ✅ Tokens (kept for backward compatibility if needed)
    private String accessToken;
    private String refreshToken;
    private Integer expiresIn;
      private String logoPath;
}