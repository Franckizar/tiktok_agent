package com.example.security.auth.Authentication;

import com.example.security.PasswordResetTokenRepository;
import com.example.security.Users.Admin.AdminRepository;
import com.example.security.Users.Admin.Admin;
import com.example.security.UserRepository;
import com.example.security.Users.PasswordResetToken;
import com.example.security.Users.Role;
import com.example.security.Users.User;
import com.example.security.Users.Player.PlayerService;
import com.example.security.Users.UserStatus;
// import com.example.security.Users.User1.PlayerService;
import com.example.security.Users.SuperAdmin.SuperAdminService;
import com.example.security.config.EmailService;
import com.example.security.config.EmailVerificationService;
import com.example.security.config.JwtService;
import com.example.security.dto.request.AuthenticationRequest;
import com.example.security.dto.request.RegisterRequest;
import com.example.security.dto.response.AuthenticationResponse;
import com.example.security.dto.response.PageResponse;
import com.example.security.dto.response.UserResponse;
import com.example.security.dto.mapper.UserMapper;
import com.example.security.token.RefreshToken;
import com.example.security.token.RefreshTokenRepository;
import com.example.security.token.TokenPair;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import com.example.security.service.FileStorageService;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationService.class);

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final PlayerService playerService;           // ← replaces User1Service
    private final SuperAdminService superAdminService;  // ← new
    private final UserMapper userMapper;
    private final EmailVerificationService emailVerificationService;
    private final FileStorageService fileStorageService;

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    // ========================================
    // REGISTRATION
    // ========================================
    @Transactional
    public AuthenticationResponse register(RegisterRequest request, HttpServletResponse response) {
        log.info("Registration attempt for email: {}", request.getEmail());

        try {
            validateRegistrationRequest(request);

            // Check duplicate email
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                log.warn("Registration failed - email already registered: {}", request.getEmail());
                throw new IllegalStateException("Email already registered");
            }

            // First user ever = SUPERADMIN, active immediately, no verification
            boolean isFirstUser = userRepository.count() == 0;
            log.debug("Is first user: {}", isFirstUser);

            Role assignedRole;
            UserStatus userStatus;

            if (isFirstUser) {
                assignedRole = Role.SUPERADMIN;
                userStatus = UserStatus.ACTIVE;
                log.info("🎉 FIRST USER - assigning SUPERADMIN role + ACTIVE status");
            } else {
                // All public registrations = UNREG + UNVERIFIED
                // Admin accounts are created directly by SuperAdmin, not through this endpoint
                assignedRole = Role.UNREG;
                userStatus = UserStatus.UNVERIFIED;
                log.info("📧 New user - UNREG + UNVERIFIED (email verification required)");
            }

            // Build user
            User user = User.builder()
                    .firstname(request.getFirstname())
                    .lastname(request.getLastname())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .status(userStatus)
                    .defaultRole(assignedRole)
                    .tokenVersion(0)
                    .build();

            user.addRole(assignedRole);

            // Save logo image if provided
            if (request.getLogoImage() != null && !request.getLogoImage().isEmpty()) {
                log.info("📸 Logo image received for: {}", request.getEmail());
                userRepository.save(user); // Save first to get ID
                String logoPath = fileStorageService.saveBase64Image(request.getLogoImage(), user.getId());
                if (logoPath != null) {
                    user.setLogoPath(logoPath);
                    log.info("✅ Logo saved at: {}", logoPath);
                }
                user.incrementTokenVersion();
                userRepository.save(user);
            } else {
                user.incrementTokenVersion();
                userRepository.save(user);
            }

            log.info("✅ User created - ID: {}, Email: {}, Role: {}, Status: {}",
                    user.getId(), user.getEmail(), assignedRole, userStatus);

            // ========================================
            // FIRST USER: SuperAdmin setup + tokens
            // ========================================
            if (isFirstUser) {
                // Create SuperAdmin profile with defaults
                superAdminService.create(user.getId(), null);

                TokenPair tokenPair = jwtService.generateTokenPair(user);
                saveRefreshToken(user, tokenPair.getRefreshToken());
                setAuthCookies(response, tokenPair);

                log.info("🎉 SUPERADMIN Registration COMPLETE");

                return AuthenticationResponse.builder()
                        .email(user.getEmail())
                        .role(assignedRole.name())
                        .message("Welcome, Super Admin! Your account is ready.")
                        .logoPath(user.getLogoPath())
                        .build();

            } else {
                // ========================================
                // REGULAR USER: Send verification email
                // ========================================
                try {
                    emailVerificationService.createAndSendVerificationCode(user);
                    log.info("📧 Verification email sent to: {}", user.getEmail());

                    return AuthenticationResponse.builder()
                            .email(user.getEmail())
                            .role(assignedRole.name())
                            .message("Registration successful! Please check your email for the verification code.")
                            .logoPath(user.getLogoPath())
                            .build();

                } catch (Exception e) {
                    log.error("Failed to send verification email - rolling back", e);
                    userRepository.delete(user);
                    throw new RuntimeException("Failed to send verification email. Please try again.");
                }
            }

        } catch (Exception e) {
            log.error("Registration failed for email: {}", request.getEmail(), e);
            throw e;
        }
    }

    // ========================================
    // AUTHENTICATION (LOGIN)
    // ========================================
    @Transactional
    public AuthenticationResponse authenticate(AuthenticationRequest request, HttpServletResponse response) {
        log.info("Authentication attempt for email: {}", request.getEmail());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + request.getEmail()));

            // Only ACTIVE accounts can log in
            if (user.getStatus() != UserStatus.ACTIVE) {
                log.warn("Authentication failed - account not active: {} (status: {})",
                        request.getEmail(), user.getStatus());
                throw new BadCredentialsException("Account not activated. Please contact an admin.");
            }

            // Save logo image if provided at login
            if (request.getLogoImage() != null && !request.getLogoImage().isEmpty()) {
                String logoPath = fileStorageService.saveBase64Image(request.getLogoImage(), user.getId());
                if (logoPath != null) {
                    user.setLogoPath(logoPath);
                    log.info("✅ Logo updated for user: {}", user.getId());
                }
            }

            // Update SuperAdmin last login timestamp
            if (user.getDefaultRole() == Role.SUPERADMIN) {
                superAdminService.updateLastLogin(user.getId());
            }

            // Invalidate old tokens
            user.incrementTokenVersion();
            userRepository.save(user);

            // Clean old refresh tokens
            refreshTokenRepository.deleteByUserId(user.getId());

            // Generate new token pair
            TokenPair tokenPair = jwtService.generateTokenPair(user);
            saveRefreshToken(user, tokenPair.getRefreshToken());
            setAuthCookies(response, tokenPair);

            log.info("✅ Authentication successful - User: {} Role: {}",
                    request.getEmail(), user.getDefaultRole());

            return AuthenticationResponse.builder()
                    .email(user.getEmail())
                    .role(user.getDefaultRole().name())
                    .logoPath(user.getLogoPath())
                    .build();

        } catch (BadCredentialsException e) {
            log.warn("Authentication failed - bad credentials for: {}", request.getEmail());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during authentication for: {}", request.getEmail(), e);
            throw e;
        }
    }

    // ========================================
    // REFRESH TOKEN
    // ========================================
    @Transactional
    public AuthenticationResponse refreshToken(String refreshTokenValue, HttpServletResponse response) {
        log.info("Refresh token request received");

        try {
            RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
                    .orElseThrow(() -> {
                        log.warn("Refresh token not found in database");
                        return new IllegalArgumentException("Invalid refresh token");
                    });

            if (refreshToken.isRevoked()) {
                throw new IllegalStateException("Refresh token has been revoked");
            }

            if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                throw new IllegalStateException("Refresh token has expired");
            }

            User user = refreshToken.getUser();

            if (!jwtService.isRefreshTokenValid(refreshTokenValue, user)) {
                throw new IllegalArgumentException("Invalid refresh token signature");
            }

            TokenPair newPair = jwtService.generateTokenPair(user);

            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);

            saveRefreshToken(user, newPair.getRefreshToken());
            setAuthCookies(response, newPair);

            log.info("✅ Token refresh successful for user: {}", user.getEmail());

            return AuthenticationResponse.builder()
                    .email(user.getEmail())
                    .role(user.getDefaultRole().name())
                    .build();

        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            throw e;
        }
    }

    // ========================================
    // LOGOUT
    // ========================================
    @Transactional
    public void logoutByRefreshToken(String refreshToken, HttpServletResponse response) {
        log.info("Logout request with refresh token");

        try {
            Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByToken(refreshToken);

            if (tokenOpt.isPresent()) {
                RefreshToken token = tokenOpt.get();
                User user = token.getUser();

                user.incrementTokenVersion();
                userRepository.save(user);
                refreshTokenRepository.deleteByUserId(user.getId());

                log.info("✅ Logout successful for user: {}", user.getEmail());
            } else {
                log.warn("Refresh token not found - clearing cookies anyway");
            }

            clearAuthCookies(response);

        } catch (Exception e) {
            log.error("Logout failed", e);
            clearAuthCookies(response);
            throw e;
        }
    }

    @Transactional
    public void logout(String email, HttpServletResponse response) {
        log.info("Logout request for email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        user.incrementTokenVersion();
        userRepository.save(user);
        refreshTokenRepository.deleteByUserId(user.getId());
        clearAuthCookies(response);

        log.info("✅ Logout successful for: {}", email);
    }

public void clearAuthCookies(HttpServletResponse response) {
    ResponseCookie accessCookie = ResponseCookie.from("accessToken", "")
        .httpOnly(true)
        .secure(false)
        .path("/")
        .maxAge(0)
        .sameSite("Lax")
        .build();

    ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", "")
        .httpOnly(true)
        .secure(false)
        .path("/")
        .maxAge(0)
        .sameSite("Lax")
        .build();

    response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
    response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
    log.debug("Auth cookies cleared");
}

    // ========================================
    // PASSWORD RESET
    // ========================================
    @Transactional
    public String initiatePasswordReset(String email) {
        log.info("Password reset initiated for email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        String token = UUID.randomUUID().toString();
        Optional<PasswordResetToken> existingTokenOpt = passwordResetTokenRepository.findByUserId(user.getId());

        if (existingTokenOpt.isPresent()) {
            PasswordResetToken existingToken = existingTokenOpt.get();
            existingToken.setToken(token);
            existingToken.setExpiryDate(LocalDateTime.now().plusHours(1));
            passwordResetTokenRepository.save(existingToken);
        } else {
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .expiryDate(LocalDateTime.now().plusHours(1))
                    .build();
            passwordResetTokenRepository.save(resetToken);
        }

        String resetLink = frontendUrl + "/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(email, resetLink);

        log.info("✅ Password reset email sent to: {}", email);
        return "Reset email sent";
    }

    @Transactional
    public String finalizePasswordReset(String token, String newPassword) {
        log.info("Password reset finalization");

        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalStateException("Reset token expired");
        }

        User user = resetToken.getUser();
        user.incrementTokenVersion();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        refreshTokenRepository.deleteByUserId(user.getId());
        passwordResetTokenRepository.delete(resetToken);

        log.info("✅ Password reset successful for: {}", user.getEmail());
        return "Password updated successfully";
    }

    // ========================================
    // ADMIN OPERATIONS - APPROVE USER
    // Assigns PLAYER or ADMIN role and creates the appropriate profile
    // ========================================
    @Transactional
    public void approveUser(Long userId, Role newRole) {
        log.info("User approval request - UserID: {}, Role: {}", userId, newRole);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new IllegalStateException("User is already active");
        }

        // Only PLAYER and ADMIN can be assigned through approval
        if (newRole != Role.PLAYER && newRole != Role.ADMIN) {
            throw new IllegalArgumentException("Invalid role for approval. Only PLAYER or ADMIN allowed.");
        }

        user.setStatus(UserStatus.ACTIVE);
        user.setDefaultRole(newRole);
        user.getRoles().clear();
        user.addRole(newRole);
        user.incrementTokenVersion();
        userRepository.save(user);

        // Create the appropriate profile based on assigned role
        if (newRole == Role.PLAYER) {
            playerService.create(user.getId(), null);
            log.info("✅ Player profile created for user: {}", userId);
        } else if (newRole == Role.ADMIN) {
            createAdminProfile(user);
            log.info("✅ Admin profile created for user: {}", userId);
        }

        log.info("✅ User approved - UserID: {}, Email: {}, Role: {}",
                userId, user.getEmail(), newRole);
    }

    // ========================================
    // GET PENDING USERS
    // ========================================
    @Transactional
    public PageResponse<UserResponse> getPendingUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> userPage = userRepository.findByStatus(UserStatus.PENDING, pageable);

        return PageResponse.<UserResponse>builder()
                .content(userPage.getContent().stream()
                        .map(userMapper::toResponse)
                        .collect(Collectors.toList()))
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .last(userPage.isLast())
                .build();
    }

    // ========================================
    // COOKIE HELPERS
    // ========================================
   private void setAuthCookies(HttpServletResponse response, TokenPair tokenPair) {
    ResponseCookie accessCookie = ResponseCookie.from("accessToken", tokenPair.getAccessToken())
        .httpOnly(true)
        .secure(false)
        .path("/")
        .maxAge(900) // 15 minutes
        .sameSite("Lax")
        .build();

    ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", tokenPair.getRefreshToken())
        .httpOnly(true)
        .secure(false)
        .path("/")
        .maxAge(7 * 24 * 60 * 60) // 7 days
        .sameSite("Lax")
        .build();

    response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
    response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

    log.debug("Auth cookies set");
}

    // ========================================
    // PRIVATE HELPERS
    // ========================================
    private void validateRegistrationRequest(RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }
    }

    private void createAdminProfile(User user) {
        try {
            if (adminRepository.findByUserId(user.getId().intValue()).isPresent()) {
                log.debug("Admin profile already exists for user: {}", user.getId());
                return;
            }

            Admin adminProfile = Admin.builder()
                    .user(user)
                    .isSuperAdmin(false)
                    .notes("Admin created by SuperAdmin")
                    .build();

            adminRepository.save(adminProfile);
            log.info("✅ Admin profile created for user: {}", user.getId());
        } catch (Exception e) {
            log.error("Failed to create admin profile for user: {}", user.getId(), e);
        }
    }

    private void saveRefreshToken(User user, String refreshTokenValue) {
        RefreshToken token = RefreshToken.builder()
                .token(refreshTokenValue)
                .user(user)
                .expiryDate(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();
        refreshTokenRepository.save(token);
        log.debug("Refresh token saved for user: {}", user.getId());
    }

    // ========================================
    // TEST AUTHENTICATION - DEV ONLY ⚠️ REMOVE IN PRODUCTION
    // ========================================
    @Transactional
    public Map<String, String> authenticateForTest(AuthenticationRequest request) {
        log.info("TEST Authentication for: {}", request.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + request.getEmail()));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BadCredentialsException("Account not activated.");
        }

        user.incrementTokenVersion();
        userRepository.save(user);
        refreshTokenRepository.deleteByUserId(user.getId());

        TokenPair tokenPair = jwtService.generateTokenPair(user);
        saveRefreshToken(user, tokenPair.getRefreshToken());

        Map<String, String> result = new HashMap<>();
        result.put("accessToken", tokenPair.getAccessToken());
        result.put("refreshToken", tokenPair.getRefreshToken());
        result.put("email", user.getEmail());
        result.put("role", user.getDefaultRole().name());

        return result;
    }
}