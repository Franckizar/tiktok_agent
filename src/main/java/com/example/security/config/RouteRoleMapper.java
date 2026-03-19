package com.example.security.config;

import org.springframework.stereotype.Component;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.util.AntPathMatcher;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class RouteRoleMapper {

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    private final Map<String, Set<String>> roleMappings = Map.of(
            // SuperAdmin-only endpoints (highest authority)
            "/api/v1/superadmin/**", Set.of("SUPERADMIN"),

            // Admin endpoints - both SUPERADMIN and ADMIN can access
            "/api/v1/admin/**", Set.of("SUPERADMIN", "ADMIN"),

            // Shared endpoints - SUPERADMIN, ADMIN, and PLAYER all have access
            "/api/v1/shared/**", Set.of("SUPERADMIN", "ADMIN", "PLAYER"),

            // Player-only endpoints
            "/api/v1/player/**", Set.of("PLAYER")
    );

    public boolean isAuthorized(String requestURI, Collection<? extends GrantedAuthority> authorities) {
        // Extract role names (remove "ROLE_" prefix if present)
        Set<String> userRoles = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.startsWith("ROLE_") ? role.substring(5) : role)
                .collect(Collectors.toSet());

        for (Map.Entry<String, Set<String>> entry : roleMappings.entrySet()) {
            if (pathMatcher.match(entry.getKey(), requestURI)) {
                return userRoles.stream().anyMatch(entry.getValue()::contains);
            }
        }

        // Allow non-mapped routes (they are handled by SecurityConfig)
        return true;
    }
}