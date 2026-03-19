//package com.example.security.test;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.data.redis.core.RedisTemplate;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.HashMap;
//import java.util.Map;
//
//@Slf4j
//@RestController
//@RequestMapping("/api/v1/cache-test")
//@RequiredArgsConstructor
//public class CacheTestController {
//
//    private final UserService userService;
//
//    // Optional: will be null when Redis is unavailable or RedisTemplate bean is not
//    // created
//    @Autowired(required = false)
//    private RedisTemplate<String, Object> redisTemplate;
//
//    @GetMapping("/user/{id}")
//    public UserCacheDTO getUserCached(@PathVariable Long id) {
//        // This should rely on @Cacheable in the service layer, not on RedisTemplate
//        // directly
//        return userService.getUserCached(id);
//    }
//
//    @GetMapping("/user-no-cache/{id}")
//    public UserCacheDTO getUserNoCache(@PathVariable Long id) {
//        return userService.getUserNoCache(id);
//    }
//
//    // Simple diagnostics endpoint to manually test Redis health
//    @GetMapping("/redis-test")
//    public Map<String, Object> testRedis() {
//        Map<String, Object> result = new HashMap<>();
//
//        if (redisTemplate == null) {
//            result.put("status", "❌ RedisTemplate is not available (Redis probably down or not configured)");
//            return result;
//        }
//
//        try {
//            // Test 1: connection (PING)
//            String ping = redisTemplate
//                    .getConnectionFactory()
//                    .getConnection()
//                    .ping();
//            result.put("connection", ping);
//
//            // Test 2: write
//            redisTemplate.opsForValue().set("test-key", "test-value");
//            result.put("write", "SUCCESS");
//
//            // Test 3: read
//            Object value = redisTemplate.opsForValue().get("test-key");
//            result.put("read", value);
//
//            result.put("status", "✅ Redis is working!");
//        } catch (Exception e) {
//            log.warn("Redis test failed: {}", e.getMessage());
//            result.put("status", "❌ Redis ERROR");
//            result.put("error", e.getMessage());
//        }
//
//        return result;
//    }
//}
