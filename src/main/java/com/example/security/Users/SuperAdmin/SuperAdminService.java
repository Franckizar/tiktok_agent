package com.example.security.Users.SuperAdmin;

import com.example.security.UserRepository;
import com.example.security.Users.User;
import com.example.security.dto.mapper.SuperAdminMapper;
import com.example.security.dto.request.SuperAdminRequest;
import com.example.security.dto.response.SuperAdminResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class SuperAdminService {

    private final SuperAdminRepository superAdminRepository;
    private final UserRepository userRepository;
    private final SuperAdminMapper superAdminMapper;

    // ========================================
    // CREATE - Called automatically on first user registration
    // ========================================
    @Transactional
    public SuperAdminResponse create(Long userId, SuperAdminRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only one SuperAdmin can ever exist
        if (superAdminRepository.existsByUserId(userId)) {
            log.warn("SuperAdmin profile already exists for user: {}", userId);
            throw new IllegalStateException("SuperAdmin profile already exists");
        }

        SuperAdmin superAdmin = SuperAdmin.builder()
                .user(user)
                .systemName(request != null ? request.getSystemName() : "E-Gaming Platform")
                .contactEmail(request != null ? request.getContactEmail() : user.getEmail())
                .contactPhone(request != null ? request.getContactPhone() : null)
                .build();

        SuperAdmin saved = superAdminRepository.save(superAdmin);
        log.info("SuperAdmin profile created for user: {}", userId);

        return superAdminMapper.toResponse(saved);
    }

    // ========================================
    // GET CURRENT SUPERADMIN PROFILE
    // ========================================
    @Transactional(readOnly = true)
    public SuperAdminResponse getCurrentProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SuperAdmin superAdmin = superAdminRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("SuperAdmin profile not found"));

        return superAdminMapper.toResponse(superAdmin);
    }

    // ========================================
    // UPDATE PROFILE
    // ========================================
    @Transactional
    public SuperAdminResponse update(SuperAdminRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SuperAdmin superAdmin = superAdminRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("SuperAdmin profile not found"));

        superAdmin.setSystemName(request.getSystemName());
        superAdmin.setContactEmail(request.getContactEmail());
        superAdmin.setContactPhone(request.getContactPhone());

        SuperAdmin saved = superAdminRepository.save(superAdmin);
        return superAdminMapper.toResponse(saved);
    }

    // ========================================
    // UPDATE LAST LOGIN - Called on every SuperAdmin login
    // ========================================
    @Transactional
    public void updateLastLogin(Long userId) {
        superAdminRepository.findByUserId(userId).ifPresent(superAdmin -> {
            superAdmin.setLastLoginAt(LocalDateTime.now());
            superAdminRepository.save(superAdmin);
            log.info("SuperAdmin last login updated for user: {}", userId);
        });
    }
}