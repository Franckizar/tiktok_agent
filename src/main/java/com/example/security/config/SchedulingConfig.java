package com.example.security.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Enable Spring Scheduling for:
 * - Cleanup of expired verification tokens (every hour)
 * - Cleanup of unverified users (daily at 3 AM)
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
    // Configuration is done via annotations
    // Scheduled methods are in EmailVerificationService
}