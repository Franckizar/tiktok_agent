package com.example.security.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;
        private final AuthenticationProvider authenticationProvider;

        public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter,
                        AuthenticationProvider authenticationProvider) {
                this.jwtAuthFilter = jwtAuthFilter;
                this.authenticationProvider = authenticationProvider;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                return http
                                // CORS Configuration
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                // Disable CSRF (using JWT)
                                .csrf(AbstractHttpConfigurer::disable)

                                // ========================================
                                // SECURITY HEADERS (HSTS)
                                // ========================================
                                .headers(headers -> headers
                                                // Force HTTPS for 1 year
                                                .httpStrictTransportSecurity(hsts -> hsts
                                                                .maxAgeInSeconds(31536000)
                                                                .includeSubDomains(true))
                                                // Prevent clickjacking
                                                .frameOptions(frame -> frame.deny())
                                                // Prevent MIME sniffing
                                                .contentTypeOptions(Customizer.withDefaults()))

                                // ========================================
                                // AUTHORIZATION RULES
                                // ========================================
                                .authorizeHttpRequests(auth -> auth

                                                // ✅ Public endpoints - no authentication required
                                                .requestMatchers(
                                                                "/api/v1/auth/**",
                                                                "/api/test/**",
                                                                "/api/v1/cache-test/**",
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**",
                                                                "/swagger-ui.html",
                                                                "/actuator/**",
                                                                "/uploads/**",
                                                                "/error")
                                                .permitAll()

                                                // ✅ SuperAdmin-only endpoints
                                                .requestMatchers("/api/v1/superadmin/**")
                                                .hasAuthority("SUPERADMIN")

                                                // ✅ Admin endpoints - SUPERADMIN and ADMIN
                                                .requestMatchers("/api/v1/admin/**")
                                                .hasAnyAuthority("SUPERADMIN", "ADMIN")

                                                // ✅ Shared endpoints - SUPERADMIN, ADMIN, and PLAYER
                                                .requestMatchers("/api/v1/shared/**")
                                                .hasAnyAuthority("SUPERADMIN", "ADMIN", "PLAYER")

                                                // ✅ Player-only endpoints
                                                .requestMatchers("/api/v1/player/**")
                                                .hasAuthority("PLAYER")

                                                // All other requests need authentication
                                                .anyRequest().authenticated())

                                // Stateless sessions (JWT)
                                .sessionManagement(sess -> sess
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // Authentication provider and JWT filter
                                .authenticationProvider(authenticationProvider)
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

                                // Exception handling
                                .exceptionHandling(exception -> exception
                                                .accessDeniedHandler((request, response, ex) -> {
                                                        response.sendError(403,
                                                                        "Access Denied: " + ex.getMessage());
                                                }))

                                .build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOrigins(Arrays.asList(
                        "http://localhost:3000",
                                "http://localhost:8088",
                                "https://tiktok-auto-upload.vercel.app",
                                "https://modest-integral-ibex.ngrok-free.app",
                                "https://tiktok-agent-one.vercel.app",
                                "https://tiktok-agent-ocmwogt41-francks-projects-35065eee.vercel.app"                        
                ));

                configuration.setAllowedMethods(Arrays.asList(
                        "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

                configuration.setAllowedHeaders(Arrays.asList("*"));

                // Required for cookies to work
                configuration.setAllowCredentials(true);

                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}