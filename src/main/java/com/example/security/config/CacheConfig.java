package com.example.security.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.RedisConnectionFactory;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    private static final Logger logger = LoggerFactory.getLogger(CacheConfig.class);

    @Autowired(required = false)
    private RedisConnectionFactory redisConnectionFactory;

    @Autowired(required = false)
    private RedisConfig redisConfig;

    @Bean
    @Primary
    public CacheManager cacheManager() {

        if (redisConnectionFactory != null && isRedisAvailable()) {
            logger.info("✅ Redis is AVAILABLE - Using Redis Cache");
            // ✅ FIXED: Return CacheManager, not RedisCacheManager
            return createRedisCacheManager();
        }

        logger.warn("⚠️ Redis is UNAVAILABLE - Using Caffeine (in-memory) cache");
        return createCaffeineCacheManager();
    }

    private boolean isRedisAvailable() {
        try {
            redisConnectionFactory.getConnection().ping();
            return true;
        } catch (Exception e) {
            logger.debug("Redis ping failed: {}", e.getMessage());
            return false;
        }
    }

    // ✅ FIXED: Return type is CacheManager, not RedisCacheManager
    private CacheManager createRedisCacheManager() {
        try {
            return redisConfig.redisCacheManager(
                    redisConnectionFactory,
                    redisConfig.redisObjectMapper());
        } catch (Exception e) {
            logger.error("Failed to create Redis cache manager, falling back to Caffeine: {}", e.getMessage());
            // ✅ Now this is valid since we return CacheManager
            return createCaffeineCacheManager();
        }
    }

    // ✅ Return type is already correct
    private CaffeineCacheManager createCaffeineCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();

        cacheManager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(1, TimeUnit.HOURS)
                .recordStats());

        logger.info("📦 Caffeine cache initialized with 1-hour TTL");
        return cacheManager;
    }
}