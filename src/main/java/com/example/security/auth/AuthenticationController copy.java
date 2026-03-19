// package com.example.security.auth;

// import com.example.security.Users.Role;
// import com.example.security.auth.Authentication.AuthenticationService;
// import com.example.security.dto.request.AuthenticationRequest;
// import com.example.security.dto.request.RegisterRequest;
// import com.example.security.dto.response.AuthenticationResponse;
// import com.example.security.dto.response.PageResponse;
// import com.example.security.dto.response.UserResponse;

// import jakarta.servlet.http.HttpServletResponse;
// import jakarta.validation.Valid;
// import lombok.RequiredArgsConstructor;
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.cache.annotation.Cacheable;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.security.core.Authentication;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/v1/auth")
// @RequiredArgsConstructor
// public class AuthenticationController {

// private static final Logger log =
// LoggerFactory.getLogger(AuthenticationController.class);

// private final AuthenticationService authenticationService;

// // ========================================
// // REGISTRATION - ✅ UPDATED WITH COOKIE SUPPORT
// // ========================================
// @PostMapping("/register")
// public ResponseEntity<AuthenticationResponse> register(
// @Valid @RequestBody RegisterRequest request,
// HttpServletResponse response) { // ← ADDED

// log.info("=== REGISTRATION REQUEST ===");
// log.info("Email: {}", request.getEmail());
// log.info("Name: {} {}", request.getFirstname(), request.getLastname());

// try {
// AuthenticationResponse authResponse = authenticationService.register(request,
// response);

// String status = authResponse.getEmail() != null ? "SUCCESS" : "PENDING
// (Awaiting Approval)";
// log.info("Registration result: {}", status);
// log.info("=== REGISTRATION COMPLETE ===");

// return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);

// } catch (IllegalStateException e) {
// log.warn("Registration failed: {}", e.getMessage());
// throw e;
// } catch (Exception e) {
// log.error("Registration error for: {}", request.getEmail(), e);
// throw e;
// }
// }

// // ========================================
// // LOGIN - ✅ UPDATED WITH COOKIE SUPPORT
// // ========================================
// @PostMapping("/authenticate")
// public ResponseEntity<AuthenticationResponse> authenticate(
// @Valid @RequestBody AuthenticationRequest request,
// HttpServletResponse response) { // ← ADDED

// log.info("=== LOGIN REQUEST ===");
// log.info("Email: {}", request.getEmail());

// try {
// AuthenticationResponse authResponse =
// authenticationService.authenticate(request, response);

// log.info("Login successful for: {}", request.getEmail());
// log.info("=== LOGIN COMPLETE ===");

// return ResponseEntity.ok(authResponse);

// } catch (Exception e) {
// log.error("Login failed for: {}", request.getEmail());
// log.error("Error: {}", e.getMessage());
// log.info("=== LOGIN FAILED ===");
// throw e;
// }
// }

// // ========================================
// // REFRESH TOKEN - ✅ UPDATED TO USE COOKIE
// // ========================================
// @PostMapping("/refresh")
// public ResponseEntity<AuthenticationResponse> refreshToken(
// @CookieValue(name = "refreshToken", required = false) String
// cookieRefreshToken,
// HttpServletResponse response) {

// log.info("=== REFRESH TOKEN REQUEST ===");

// try {
// if (cookieRefreshToken == null || cookieRefreshToken.trim().isEmpty()) {
// log.warn("Refresh token missing in cookie");
// throw new IllegalArgumentException("refreshToken cookie is required");
// }

// AuthenticationResponse authResponse =
// authenticationService.refreshToken(cookieRefreshToken.trim(),
// response);

// log.info("Token refresh successful");
// log.info("=== REFRESH TOKEN COMPLETE ===");

// return ResponseEntity.ok(authResponse);

// } catch (Exception e) {
// log.error("Token refresh failed: {}", e.getMessage());
// log.info("=== REFRESH TOKEN FAILED ===");
// throw e;
// }
// }

// // ========================================
// // LOGOUT - ✅ UPDATED TO CLEAR COOKIES
// // ========================================
// @PostMapping("/logout")
// public ResponseEntity<String> logout(
// Authentication authentication,
// HttpServletResponse response) { // ← ADDED

// log.info("=== LOGOUT REQUEST ===");

// try {
// if (authentication == null || !authentication.isAuthenticated()) {
// log.warn("Logout attempted without authentication");
// throw new IllegalStateException("User not authenticated");
// }

// String email = authentication.getName();
// log.info("Logging out user: {}", email);

// authenticationService.logout(email, response);

// log.info("Logout successful for: {}", email);
// log.info("=== LOGOUT COMPLETE ===");

// return ResponseEntity.ok("Logged out successfully");

// } catch (Exception e) {
// log.error("Logout error: {}", e.getMessage());
// log.info("=== LOGOUT FAILED ===");
// throw e;
// }
// }

// // ========================================
// // PASSWORD RESET - INITIATE
// // ========================================
// @PostMapping("/forgot-password")
// public ResponseEntity<String> forgotPassword(@RequestParam String email) {

// log.info("=== PASSWORD RESET REQUEST ===");
// log.info("Email: {}", email);

// try {
// String result = authenticationService.initiatePasswordReset(email);

// log.info("Password reset email sent to: {}", email);
// log.info("=== PASSWORD RESET INITIATED ===");

// return ResponseEntity.ok(result);

// } catch (Exception e) {
// log.error("Password reset failed for: {}", email, e);
// log.info("=== PASSWORD RESET FAILED ===");
// throw e;
// }
// }

// // ========================================
// // PASSWORD RESET - FINALIZE
// // ========================================
// @PostMapping("/reset-password")
// public ResponseEntity<String> resetPassword(
// @RequestParam String token,
// @RequestParam String newPassword) {

// log.info("=== PASSWORD RESET FINALIZATION ===");
// log.info("Token received (length: {})", token.length());

// try {
// String result = authenticationService.finalizePasswordReset(token,
// newPassword);

// log.info("Password reset completed successfully");
// log.info("=== PASSWORD RESET COMPLETE ===");

// return ResponseEntity.ok(result);

// } catch (Exception e) {
// log.error("Password reset finalization failed: {}", e.getMessage());
// log.info("=== PASSWORD RESET FAILED ===");
// throw e;
// }
// }

// // ========================================
// // ADMIN - GET PENDING USERS
// // ========================================

// // @Cacheable(value = "pendingUsers", key = "#page + '-' + #size")
// // @GetMapping("/admin/pending-users")
// // public ResponseEntity<PageResponse<UserResponse>> getPendingUsers(
// // @RequestParam(defaultValue = "0") int page,
// // @RequestParam(defaultValue = "10") int size) {

// // log.info("=== ADMIN: FETCH PENDING USERS ===");
// // log.info("Page: {}, Size: {}", page, size);

// // try {
// // PageResponse<UserResponse> response =
// // authenticationService.getPendingUsers(page, size);

// // log.info("Returning {} pending users", response.getContent().size());
// // log.info("=== FETCH COMPLETE ===");

// // return ResponseEntity.ok(response);

// // } catch (Exception e) {
// // log.error("Failed to fetch pending users", e);
// // log.info("=== FETCH FAILED ===");
// // throw e;
// // }
// // }

// // ========================================
// // ADMIN - APPROVE USER
// // ========================================

// @PostMapping("/admin/approve/{userId}/{role}")
// public ResponseEntity<String> approveUser(
// @PathVariable Long userId,
// @PathVariable Role role) {

// log.info("=== ADMIN: APPROVE USER ===");
// log.info("UserID: {}, Assigned Role: {}", userId, role);

// try {
// authenticationService.approveUser(userId, role);

// log.info("User {} approved successfully as {}", userId, role);
// log.info("=== APPROVAL COMPLETE ===");

// return ResponseEntity.ok("User " + userId + " approved as " + role);

// } catch (Exception e) {
// log.error("User approval failed for UserID: {}", userId, e);
// log.info("=== APPROVAL FAILED ===");
// throw e;
// }
// }
// }