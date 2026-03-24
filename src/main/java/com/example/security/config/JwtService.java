package com.example.security.config;

import com.example.security.Users.User;
import com.example.security.token.TokenPair;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpServletRequest;

import java.security.Key;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
public class JwtService {

    @Value("${jwt.access.secret}")
    private String ACCESS_SECRET_KEY;

    @Value("${jwt.refresh.secret}")
    private String REFRESH_SECRET_KEY;

    @Value("${jwt.access.expiration:900000}")
    private long ACCESS_JWT_EXPIRATION;

    @Value("${jwt.refresh.expiration:604800000}")
    private long REFRESH_JWT_EXPIRATION;

    // ================== CORE EXTRACTION METHODS ==================

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject, ACCESS_SECRET_KEY);
    }

    public Integer extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Integer.class), ACCESS_SECRET_KEY);
    }

    public Integer extractTokenVersion(String token) {
        return extractClaim(token, claims -> claims.get("token_version", Integer.class), ACCESS_SECRET_KEY);
    }

    public List<String> extractRoles(String token) {
        Claims claims = extractAllClaims(token, ACCESS_SECRET_KEY);
        try {
            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) claims.get("roles");
            return roles != null ? roles : Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to extract roles from token", e);
            return Collections.emptyList();
        }
    }

    // ================== PROFILE ID EXTRACTORS ==================

    // ✅ UPDATED: Player profile ID (replaces extractUser1Id)
    public Long extractPlayerId(String token) {
        return extractClaim(token, claims -> claims.get("playerId", Long.class), ACCESS_SECRET_KEY);
    }

    // ✅ UPDATED: SuperAdmin profile ID
    public Long extractSuperAdminId(String token) {
        return extractClaim(token, claims -> claims.get("superAdminId", Long.class), ACCESS_SECRET_KEY);
    }

    // ================== TOKEN GENERATION ==================

    public TokenPair generateTokenPair(UserDetails userDetails) {
        log.info("🎫 Generating token pair for user: {}", userDetails.getUsername());

        if (!(userDetails instanceof User user)) {
            throw new IllegalArgumentException("UserDetails must be instance of User");
        }

        Map<String, Object> claims = buildExtensibleClaims(user);

        String accessToken = createAccessToken(claims, userDetails);
        String refreshToken = createRefreshToken(claims, userDetails);

        log.info("✅ Token pair generated successfully");

        return new TokenPair(accessToken, refreshToken);
    }

    private Map<String, Object> buildExtensibleClaims(User user) {
        Map<String, Object> claims = new HashMap<>();

        // Core claims
        claims.put("token_version", user.getTokenVersion());
        claims.put("userId", user.getId());
        claims.put("firstname", user.getFirstname());
        claims.put("lastname", user.getLastname());

        // ✅ UPDATED: Player profile claim (replaces user1Id)
        if (user.getPlayerProfile() != null) {
            claims.put("playerId", user.getPlayerProfile().getId());
        }

        // ✅ NEW: SuperAdmin profile claim
        if (user.getSuperAdminProfile() != null) {
            claims.put("superAdminId", user.getSuperAdminProfile().getId());
        }

        // Roles — stored without ROLE_ prefix
        List<String> roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.replace("ROLE_", ""))
                .collect(Collectors.toList());
        claims.put("roles", roles);

        log.debug("📋 Built claims for user {}: roles={}, userId={}",
                user.getUsername(), roles, user.getId());

        return claims;
    }

    private String createAccessToken(Map<String, Object> claims, UserDetails userDetails) {
        return buildToken(claims, userDetails, ACCESS_SECRET_KEY, ACCESS_JWT_EXPIRATION);
    }

    private String createRefreshToken(Map<String, Object> claims, UserDetails userDetails) {
        return buildToken(claims, userDetails, REFRESH_SECRET_KEY, REFRESH_JWT_EXPIRATION);
    }

    private String buildToken(Map<String, Object> claims, UserDetails userDetails,
                              String secretKey, long expiration) {
        long currentTime = System.currentTimeMillis();

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(currentTime))
                .setExpiration(new Date(currentTime + expiration))
                .signWith(getSigningKey(secretKey), SignatureAlgorithm.HS256)
                .compact();
    }

    // ================== VALIDATION ==================

    public boolean isAccessTokenValid(String accessToken, UserDetails userDetails) {
        log.debug("🔍 Validating access token for user: {}", userDetails.getUsername());

        if (!(userDetails instanceof User user)) {
            log.warn("⚠️ UserDetails is not instance of User");
            return false;
        }

        try {
            final String email = extractUsername(accessToken);
            final Integer tokenVersion = extractTokenVersion(accessToken);

            boolean valid = email.equals(user.getUsername()) &&
                    tokenVersion != null &&
                    tokenVersion.equals(user.getTokenVersion()) &&
                    !isTokenExpired(accessToken, ACCESS_SECRET_KEY);

            if (!valid) {
                log.warn("⚠️ Token validation failed - email match: {}, version match: {}, not expired: {}",
                        email.equals(user.getUsername()),
                        tokenVersion != null && tokenVersion.equals(user.getTokenVersion()),
                        !isTokenExpired(accessToken, ACCESS_SECRET_KEY));
            }

            return valid;

        } catch (Exception e) {
            log.error("❌ Error validating access token: {}", e.getMessage());
            return false;
        }
    }

    public boolean isRefreshTokenValid(String refreshToken, UserDetails userDetails) {
        log.debug("🔍 Validating refresh token for user: {}", userDetails.getUsername());

        if (!(userDetails instanceof User user)) {
            log.warn("⚠️ UserDetails is not instance of User");
            return false;
        }

        try {
            final String email = extractRefreshUsername(refreshToken);
            final Integer tokenVersion = extractRefreshTokenVersion(refreshToken);

            boolean valid = email.equals(user.getUsername()) &&
                    tokenVersion != null &&
                    tokenVersion.equals(user.getTokenVersion()) &&
                    !isTokenExpired(refreshToken, REFRESH_SECRET_KEY);

            return valid;

        } catch (Exception e) {
            log.error("❌ Error validating refresh token: {}", e.getMessage());
            return false;
        }
    }

    // ================== HELPERS ==================

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver, String secretKey) {
        final Claims claims = extractAllClaims(token, secretKey);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token, String secretKey) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey(secretKey))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            log.error("❌ Token expired: {}", e.getMessage());
            throw e;
        } catch (JwtException e) {
            log.error("❌ Invalid token: {}", e.getMessage());
            throw e;
        }
    }

    public String extractRefreshUsername(String refreshToken) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey(REFRESH_SECRET_KEY))
                .build()
                .parseClaimsJws(refreshToken)
                .getBody();
        return claims.getSubject();
    }

    private Integer extractRefreshTokenVersion(String refreshToken) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey(REFRESH_SECRET_KEY))
                .build()
                .parseClaimsJws(refreshToken)
                .getBody();
        return claims.get("token_version", Integer.class);
    }

    private boolean isTokenExpired(String token, String secretKey) {
        try {
            Date expiration = extractExpiration(token, secretKey);
            boolean expired = expiration.before(new Date());
            if (expired) {
                log.warn("⚠️ Token expired at: {}", expiration);
            }
            return expired;
        } catch (ExpiredJwtException e) {
            log.warn("⚠️ Token already expired");
            return true;
        }
    }

    private Date extractExpiration(String token, String secretKey) {
        return extractClaim(token, Claims::getExpiration, secretKey);
    }

    private Key getSigningKey(String secretKey) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    // Add this import at the top


// Add this method anywhere in JwtService
public Long extractUserIdFromRequest(HttpServletRequest request) {
    String authHeader = request.getHeader("Authorization");
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        throw new RuntimeException("Missing or invalid Authorization header");
    }
    String token = authHeader.substring(7);
    Integer userId = extractUserId(token); // already exists
    if (userId == null) throw new RuntimeException("userId claim missing from token");
    return userId.longValue();
}
}