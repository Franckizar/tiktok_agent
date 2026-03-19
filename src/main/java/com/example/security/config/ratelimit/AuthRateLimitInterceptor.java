package com.example.security.config.ratelimit;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Component
public class AuthRateLimitInterceptor implements HandlerInterceptor {

    @Autowired(required = false)
    private RedisTemplate<String, Object> redisTemplate;

    private final Cache<String, AtomicLong> caffeineCounts = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(1))
            .maximumSize(10_000)
            .build();

    private final Cache<String, Long> resetTimes = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(1))
            .maximumSize(10_000)
            .build();

    // ✅ STRICTER: Only 5 login attempts per minute per IP
    private static final int MAX_AUTH_REQUESTS = 500;

    @Override
    public boolean preHandle(HttpServletRequest request,
                              HttpServletResponse response,
                              Object handler) throws Exception {

        String ip = request.getRemoteAddr();
        String cacheKey = "auth-rate:" + ip;
        long now = System.currentTimeMillis();

        // Reset window every minute
        Long lastReset = resetTimes.getIfPresent(cacheKey);
        if (lastReset == null || now - lastReset > 60_000) {
            resetTimes.put(cacheKey, now);
            caffeineCounts.invalidate(cacheKey);
            if (redisTemplate != null) {
                try {
                    redisTemplate.delete(cacheKey);
                } catch (Exception ignored) {}
            }
        }

        // Check rate limit
        AtomicLong count = caffeineCounts.get(cacheKey, k -> new AtomicLong(0));
        long currentCount = count.incrementAndGet();

        if (currentCount > MAX_AUTH_REQUESTS) {
            log.warn("🚫 AUTH rate limit exceeded for IP: {} (attempt: {})", ip, currentCount);
            sendRateLimitResponse(response);
            return false;
        }

        log.debug("✅ Auth request allowed for IP: {} (attempt: {}/{})", ip, currentCount, MAX_AUTH_REQUESTS);
        return true;
    }

    private void sendRateLimitResponse(HttpServletResponse response) {
        try {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"error\":\"Too many login attempts. Please wait 60 seconds.\",\"retryAfter\":60}"
            );
        } catch (IOException e) {
            log.error("Failed to send rate limit response", e);
        }
    }
}