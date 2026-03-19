package com.example.security.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.example.security.config.ratelimit.AuthRateLimitInterceptor;
import com.example.security.config.ratelimit.RateLimitInterceptor;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(WebConfig.class);

    private final RateLimitInterceptor rateLimitInterceptor;
    private final AuthRateLimitInterceptor authRateLimitInterceptor;

    public WebConfig(RateLimitInterceptor rateLimitInterceptor,
                     AuthRateLimitInterceptor authRateLimitInterceptor) {
        this.rateLimitInterceptor = rateLimitInterceptor;
        this.authRateLimitInterceptor = authRateLimitInterceptor;
    }

    // ===== Static resource config (uploads) =====
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        log.info("=== CONFIGURING STATIC RESOURCE HANDLERS ===");

        // ✅ Fixed: use relative path — resolves to project root /uploads/
        // Works on any machine without hardcoded paths
        String uploadDir = System.getProperty("user.dir") + "/uploads/";
        String resourcePath = Paths.get(uploadDir).toUri().toString();

        log.info("Configuring static resource handler:");
        log.info("  - URL Pattern: /uploads/**");
        log.info("  - File Location: {}", resourcePath);

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourcePath)
                .setCachePeriod(3600);

        log.info("Static resource handler configured successfully");
        log.info("Files accessible at: http://localhost:8088/uploads/...");
    }

    // ===== Rate limit interceptors =====
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        log.info("=== REGISTERING RATE LIMIT INTERCEPTORS ===");

        registry.addInterceptor(authRateLimitInterceptor)
                .addPathPatterns("/api/v1/auth/login")
                .addPathPatterns("/api/v1/auth/register")
                .addPathPatterns("/api/v1/auth/refresh-token")
                .order(1);

        log.info("Auth rate limiter: 5 req/min on login, register, refresh-token");

        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/refresh-token")
                .order(2);

        log.info("General rate limiter: 10000 req/min on /api/**");
        log.info("=== RATE LIMIT CONFIGURATION COMPLETE ===");
    }
}