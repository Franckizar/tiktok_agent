//package com.example.security.test;
//
//import org.springframework.cache.annotation.Cacheable;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import com.example.security.UserRepository;
//import com.example.security.Users.User;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class UserService {
//
//    private final UserRepository userRepository;
//
//    @Cacheable(cacheNames = "testUsers", key = "#id", unless = "#result == null")
//    @Transactional(readOnly = true)
//    public UserCacheDTO getUserCached(Long id) {
//        log.error("🔴🔴🔴 CACHE MISS - DATABASE HIT for ID: {} 🔴🔴🔴", id);
//        log.error("🔴 This message should appear ONLY ONCE per ID!");
//        log.error("🔴 If you see this twice for same ID, caching is NOT working!");
//
//        try {
//            Thread.sleep(2000);
//        } catch (InterruptedException e) {
//            Thread.currentThread().interrupt();
//        }
//
//        User user = userRepository.findById(id).orElse(null);
//
//        if (user == null) {
//            log.error("❌ User not found with ID: {}", id);
//            return null;
//        }
//
//        // Force lazy loading
//        if (user.getUser1Profile() != null) {
//            user.getUser1Profile().getBio();
//        }
//
//        UserCacheDTO result = UserCacheMapper.toDTO(user);
//        log.error("✅ Returning user: {}", result.getEmail());
//
//        return result;
//    }
//
//    @Transactional(readOnly = true)
//    public UserCacheDTO getUserNoCache(Long id) {
//        log.info("⚫ NO CACHE - Always hitting database for user ID: {}", id);
//
//        try {
//            Thread.sleep(2000);
//        } catch (InterruptedException e) {
//            Thread.currentThread().interrupt();
//        }
//
//        User user = userRepository.findById(id).orElse(null);
//
//        if (user == null) {
//            return null;
//        }
//
//        if (user.getUser1Profile() != null) {
//            user.getUser1Profile().getBio();
//        }
//
//        return UserCacheMapper.toDTO(user);
//    }
//}