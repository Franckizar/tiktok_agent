package com.example.security.config.ratelimit;

import com.example.security.Users.User;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    // Caffeine fallback (always available)
    private final Cache<String, AtomicLong> caffeineCounts = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(1))
            .maximumSize(10_000)
            .build();

    private final Cache<String, Long> resetTimes = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(1))
            .maximumSize(10_000)
            .build();

    private static final int MAX_REQUESTS = 100000000; // 10 req/min per user/IP

    @Override
    public boolean preHandle(HttpServletRequest request,
            HttpServletResponse response,
            Object handler) throws Exception {

        String userId = resolveUserId(request);
        String cacheKey = "rate:" + userId;
        long now = System.currentTimeMillis();

        // Reset window every minute
        Long lastReset = resetTimes.getIfPresent(cacheKey);
        if (lastReset == null || now - lastReset > 60_000) {
            resetTimes.put(cacheKey, now);
            if (redisTemplate != null) {
                try {
                    redisTemplate.delete(cacheKey);
                } catch (Exception e) {
                    log.debug("Redis delete failed during reset: {}", e.getMessage());
                }
            }
            caffeineCounts.invalidate(cacheKey);
        }

        // Try Redis first (distributed)
        if (redisTemplate != null && tryRedisRateLimit(cacheKey, response)) {
            return false; // Blocked by Redis
        }

        // Fallback to Caffeine (local protection)
        if (tryCaffeineRateLimit(cacheKey, response)) {
            return false; // Blocked by Caffeine
        }

        log.debug("✅ Request allowed for user/IP: {} (count: {})", userId, getCurrentCount(cacheKey));
        return true;
    }

    private boolean tryRedisRateLimit(String cacheKey, HttpServletResponse response) {
        try {
            Long requests = redisTemplate.opsForValue().increment(cacheKey, 1);
            if (requests == 1) {
                redisTemplate.expire(cacheKey, Duration.ofMinutes(1));
            }
            if (requests > MAX_REQUESTS) {
                log.warn("🚫 Redis rate limit exceeded: {} (count: {})", cacheKey, requests);
                sendRateLimitResponse(response);
                return true;
            }
            return false;
        } catch (Exception e) {
            log.debug("Redis rate limit unavailable, using Caffeine fallback: {}", e.getMessage());
            return false; // Continue to Caffeine
        }
    }

    private boolean tryCaffeineRateLimit(String cacheKey, HttpServletResponse response) {
        AtomicLong count = caffeineCounts.get(cacheKey, k -> new AtomicLong(0));
        long currentCount = count.incrementAndGet();

        if (currentCount > MAX_REQUESTS) {
            log.warn("🚫 Caffeine rate limit exceeded: {} (count: {})", cacheKey, currentCount);
            sendRateLimitResponse(response);
            return true;
        }
        return false;
    }

    private long getCurrentCount(String cacheKey) {
        if (redisTemplate != null) {
            try {
                Long redisCount = (Long) redisTemplate.opsForValue().get(cacheKey);
                if (redisCount != null)
                    return redisCount;
            } catch (Exception ignored) {
            }
        }
        AtomicLong caffeineCount = caffeineCounts.getIfPresent(cacheKey);
        return caffeineCount != null ? caffeineCount.get() : 0;
    }

    private void sendRateLimitResponse(HttpServletResponse response) {
        try {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Rate limit exceeded. Try again later.\",\"retryAfter\":60}");
        } catch (IOException e) {
            log.error("Failed to send rate limit response", e);
        }
    }

    private String resolveUserId(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            Object principal = auth.getPrincipal();
            if (principal instanceof User user) {
                return String.valueOf(user.getId());
            }
        }

        // Fallback to IP address
        return request.getRemoteAddr();
    }
}
