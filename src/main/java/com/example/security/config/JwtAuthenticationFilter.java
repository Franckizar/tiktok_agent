package com.example.security.config;

import io.micrometer.common.lang.NonNull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final RouteRoleMapper routeRoleMapper;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String path = request.getServletPath();
        String method = request.getMethod();

        log.info("=".repeat(80));
        log.info("🔍 JWT FILTER - Incoming Request");
        log.info("📍 Path: {} {}", method, path);
        log.info("🌐 Full URI: {}", request.getRequestURI());

        // ✅ Skip JWT validation for public paths
        if (path.startsWith("/swagger-ui") ||
                path.startsWith("/v3/api-docs") ||
                path.startsWith("/swagger-resources") ||
                path.startsWith("/webjars") ||
                path.equals("/swagger-ui.html") ||
                path.startsWith("/api/v1/auth/") ||
                path.startsWith("/api/v1/cache-test/") ||
                path.startsWith("/actuator") ||
                path.startsWith("/uploads/")) {
            log.info("✅ PUBLIC PATH - Skipping JWT validation for: {}", path);
            filterChain.doFilter(request, response);
            return;
        }

        log.info("🔒 PROTECTED PATH - JWT validation required");

        // ✅ TRY TO GET TOKEN FROM COOKIE FIRST
        String jwt = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    jwt = cookie.getValue();
                    log.info("🍪 JWT Token found in COOKIE");
                    break;
                }
            }
        }

        // ✅ FALLBACK: Try Authorization header (for Postman Bearer token testing)
        if (jwt == null) {
            final String authHeader = request.getHeader("Authorization");
            log.info("📨 Authorization Header Present: {}", authHeader != null);

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);
                log.info("🔑 JWT Token found in AUTHORIZATION HEADER (Bearer)");
            }
        }

        // ✅ No token found - return 401 so frontend can trigger refresh
        if (jwt == null) {
            log.warn("⚠️ NO TOKEN FOUND - Neither in cookie nor Authorization header");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"No token found\", \"status\": 401}");
            return;
        }

        log.info("🎫 JWT Token Extracted: {}...", jwt.substring(0, Math.min(30, jwt.length())));
        log.info("🎫 JWT Token Length: {} characters", jwt.length());

        try {
            log.info("🔓 Step 1: Extracting username from JWT");
            final String userEmail = jwtService.extractUsername(jwt);
            log.info("✅ Username extracted: {}", userEmail);

            if (userEmail == null) {
                log.error("❌ Username is NULL - JWT may be malformed");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Invalid token\", \"status\": 401}");
                return;
            }

            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                log.info("ℹ️ Authentication already exists in SecurityContext - Skipping");
                filterChain.doFilter(request, response);
                return;
            }

            log.info("🔓 Step 2: Loading UserDetails for: {}", userEmail);
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
            log.info("✅ UserDetails loaded successfully");
            log.info("👤 Username: {}", userDetails.getUsername());
            log.info("🎭 UserDetails Authorities: {}", userDetails.getAuthorities());

            log.info("🔓 Step 3: Validating token structure and expiration");
            if (!jwtService.isAccessTokenValid(jwt, userDetails)) {
                log.error("❌ TOKEN VALIDATION FAILED");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Invalid or expired token\", \"status\": 401}");
                return;
            }
            log.info("✅ Token validation passed");

            log.info("🔓 Step 4: Extracting roles from JWT");
            List<String> jwtRoles = jwtService.extractRoles(jwt);
            log.info("🎭 JWT Roles: {}", jwtRoles);

            if (jwtRoles == null || jwtRoles.isEmpty()) {
                log.warn("⚠️ No roles found in JWT token");
            }

            log.info("🔓 Step 5: Validating JWT roles against UserDetails");
            if (!validateJwtRoles(userDetails, jwtRoles)) {
                log.error("❌ ROLE VALIDATION FAILED");
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Invalid role claims\", \"status\": 403}");
                return;
            }
            log.info("✅ Role validation passed");

            Set<GrantedAuthority> authorities = jwtRoles.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toSet());

            log.info("🔐 Granted Authorities created: {}", authorities);

            log.info("🔓 Step 6: Checking route authorization");
            if (!routeRoleMapper.isAuthorized(request.getRequestURI(), authorities)) {
                log.error("❌ ROUTE AUTHORIZATION FAILED");
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Insufficient privileges\", \"status\": 403}");
                return;
            }
            log.info("✅ Route authorization passed");

            log.info("🔓 Step 7: Creating Authentication Token");
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails, null, authorities);
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);

            log.info("✅✅✅ AUTHENTICATION SUCCESSFUL ✅✅✅");
            log.info("👤 User: {}", userEmail);
            log.info("🎭 Authorities: {}", authorities);
            log.info("🛣️ Accessing: {} {}", method, path);
            log.info("=".repeat(80));

        } catch (io.jsonwebtoken.ExpiredJwtException ex) {
            log.error("💥 Token expired: {}", ex.getMessage());
            log.error("=".repeat(80));
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Token expired\", \"status\": 401}");
            return;

        } catch (Exception ex) {
            log.error("💥💥💥 EXCEPTION IN JWT FILTER 💥💥💥");
            log.error("💥 Exception Type: {}", ex.getClass().getName());
            log.error("💥 Exception Message: {}", ex.getMessage());
            log.error("=".repeat(80));
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Authentication failed\", \"status\": 401}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean validateJwtRoles(UserDetails userDetails, List<String> jwtRoles) {
        log.debug("🔍 Validating JWT roles");

        Set<String> validRoles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.replace("ROLE_", ""))
                .collect(Collectors.toSet());

        return jwtRoles.stream().allMatch(validRoles::contains);
    }
}