package com.example.security.auth;

import com.example.security.Users.Role;
import com.example.security.auth.Authentication.AuthenticationService;
import com.example.security.config.EmailVerificationService;
import com.example.security.dto.emailverification.ResendVerificationRequest;
import com.example.security.dto.emailverification.VerificationRequest;
import com.example.security.dto.request.AuthenticationRequest;
import com.example.security.dto.request.RegisterRequest;
import com.example.security.dto.response.AuthenticationResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationController.class);

    private final AuthenticationService authenticationService;
    private final EmailVerificationService emailVerificationService;

    // ========================================
    // REGISTRATION
    // Public endpoint - creates UNREG user, sends verification email
    // First user ever becomes SUPERADMIN automatically
    // ========================================
    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {

        log.info("=== REGISTRATION REQUEST === Email: {}", request.getEmail());

        try {
            AuthenticationResponse authResponse = authenticationService.register(request, response);
            log.info("=== REGISTRATION COMPLETE ===");
            return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);

        } catch (IllegalStateException e) {
            log.warn("Registration failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Registration error for: {}", request.getEmail(), e);
            throw e;
        }
    }

    // ========================================
    // LOGIN
    // ========================================
    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @Valid @RequestBody AuthenticationRequest request,
            HttpServletResponse response) {

        log.info("=== LOGIN REQUEST === Email: {}", request.getEmail());

        try {
            AuthenticationResponse authResponse = authenticationService.authenticate(request, response);
            log.info("=== LOGIN COMPLETE ===");
            return ResponseEntity.ok(authResponse);

        } catch (Exception e) {
            log.error("Login failed for: {} - {}", request.getEmail(), e.getMessage());
            throw e;
        }
    }

    // ========================================
    // TEST LOGIN - DEV ONLY ⚠️ REMOVE IN PRODUCTION
    // Returns tokens in response body instead of cookies
    // ========================================
    @PostMapping("/authenticate/test")
    public ResponseEntity<Map<String, Object>> authenticateTest(
            @Valid @RequestBody AuthenticationRequest request) {

        log.info("=== TEST LOGIN REQUEST === Email: {}", request.getEmail());

        try {
            Map<String, String> tokens = authenticationService.authenticateForTest(request);

            Map<String, Object> testResponse = new HashMap<>();
            testResponse.put("accessToken", tokens.get("accessToken"));
            testResponse.put("refreshToken", tokens.get("refreshToken"));
            testResponse.put("email", tokens.get("email"));
            testResponse.put("role", tokens.get("role"));
            testResponse.put("warning", "⚠️ DEV ONLY - Remove in production");

            log.info("=== TEST LOGIN COMPLETE ===");
            return ResponseEntity.ok(testResponse);

        } catch (Exception e) {
            log.error("Test login failed for: {}", request.getEmail(), e);
            throw e;
        }
    }

    // ========================================
    // REFRESH TOKEN
    // Reads from cookie or Authorization header
    // ========================================
  @PostMapping("/refresh")
public ResponseEntity<AuthenticationResponse> refreshToken(
        @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        HttpServletRequest request, // ✅ added
        HttpServletResponse response) {

    log.info("=== REFRESH TOKEN REQUEST ===");

    // ✅ Debug: log all cookies received
    log.info("=== COOKIES RECEIVED ===");
    if (request.getCookies() != null) {
        for (jakarta.servlet.http.Cookie c : request.getCookies()) {
            log.info("Cookie found: {} = {}...", c.getName(), 
                c.getValue().substring(0, Math.min(10, c.getValue().length())));
        }
    } else {
        log.warn("NO COOKIES RECEIVED AT ALL");
    }
    log.info("cookieRefreshToken present: {}", cookieRefreshToken != null);

    try {
        String refreshTokenValue = null;

        if (cookieRefreshToken != null && !cookieRefreshToken.trim().isEmpty()) {
            refreshTokenValue = cookieRefreshToken.trim();
        } else if (authHeader != null && authHeader.startsWith("Bearer ")) {
            refreshTokenValue = authHeader.substring(7).trim();
        }

        if (refreshTokenValue == null || refreshTokenValue.isEmpty()) {
            throw new IllegalArgumentException("Refresh token is required");
        }

        AuthenticationResponse authResponse = authenticationService.refreshToken(refreshTokenValue, response);
        log.info("=== REFRESH TOKEN COMPLETE ===");
        return ResponseEntity.ok(authResponse);

    } catch (Exception e) {
        log.error("Token refresh failed: {}", e.getMessage());
        throw e;
    }
}
    // ========================================
    // LOGOUT
    // ========================================
    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            @CookieValue(value = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {

        log.info("=== LOGOUT REQUEST ===");

        try {
            if (refreshToken != null && !refreshToken.isEmpty()) {
                authenticationService.logoutByRefreshToken(refreshToken, response);
            } else {
                authenticationService.clearAuthCookies(response);
            }

            log.info("=== LOGOUT COMPLETE ===");
            return ResponseEntity.ok("Logged out successfully");

        } catch (Exception e) {
            log.error("Logout error: {}", e.getMessage());
            authenticationService.clearAuthCookies(response);
            return ResponseEntity.ok("Logged out successfully");
        }
    }

    // ========================================
    // FORGOT PASSWORD
    // ========================================
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        log.info("=== PASSWORD RESET REQUEST === Email: {}", email);

        try {
            String result = authenticationService.initiatePasswordReset(email);
            log.info("=== PASSWORD RESET INITIATED ===");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Password reset failed for: {}", email, e);
            throw e;
        }
    }

    // ========================================
    // RESET PASSWORD
    // ========================================
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {

        log.info("=== PASSWORD RESET FINALIZATION ===");

        try {
            String result = authenticationService.finalizePasswordReset(token, newPassword);
            log.info("=== PASSWORD RESET COMPLETE ===");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Password reset finalization failed: {}", e.getMessage());
            throw e;
        }
    }

    // ========================================
    // APPROVE USER - Called by Admin or SuperAdmin
    // Assigns PLAYER or ADMIN role and creates appropriate profile
    // ========================================
    @PostMapping("/admin/approve/{userId}/{role}")
    public ResponseEntity<String> approveUser(
            @PathVariable Long userId,
            @PathVariable Role role) {

        log.info("=== APPROVE USER === UserID: {}, Role: {}", userId, role);

        try {
            authenticationService.approveUser(userId, role);
            log.info("=== APPROVAL COMPLETE ===");
            return ResponseEntity.ok("User " + userId + " approved as " + role);
        } catch (Exception e) {
            log.error("Approval failed for UserID: {}", userId, e);
            throw e;
        }
    }

    // ========================================
    // VERIFY EMAIL
    // ========================================
    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(
            @Valid @RequestBody VerificationRequest request) {

        log.info("=== EMAIL VERIFICATION === Email: {}", request.getEmail());

        try {
            String result = emailVerificationService.verifyEmail(request.getEmail(), request.getCode());

            Map<String, String> response = new HashMap<>();
            response.put("message", result);
            response.put("email", request.getEmail());

            log.info("=== VERIFICATION COMPLETE ===");
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);

        } catch (IllegalStateException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);

        } catch (Exception e) {
            log.error("Verification error for: {}", request.getEmail(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Verification failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ========================================
    // RESEND VERIFICATION CODE
    // ========================================
    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerificationCode(
            @Valid @RequestBody ResendVerificationRequest request) {

        log.info("=== RESEND VERIFICATION === Email: {}", request.getEmail());

        try {
            String result = emailVerificationService.resendVerificationCode(request.getEmail());

            Map<String, String> response = new HashMap<>();
            response.put("message", result);
            response.put("email", request.getEmail());

            log.info("=== RESEND COMPLETE ===");
            return ResponseEntity.ok(response);

        } catch (IllegalStateException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);

        } catch (Exception e) {
            log.error("Resend error for: {}", request.getEmail(), e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to resend code. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}