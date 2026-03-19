package com.example.security.Users.Admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;

    /**
     * Get all admin profiles with caching
     * Returns empty list if no admins (never null)
     */
    @Cacheable(value = "admins", key = "'all'")
    public List<AdminResponse> getAllAdminProfiles() {
        log.debug("🔍 Cache MISS - Loading admins from database");

        List<Admin> admins = adminRepository.findAll();
        log.info("✅ Database returned {} admin records", admins.size());

        List<AdminResponse> responses = admins.stream()
                .map(this::safeMapToResponse)
                .filter(Objects::nonNull)
                .toList();

        log.info("✨ Returning {} valid admin responses ({}%)",
                responses.size(),
                admins.isEmpty() ? 0 : (responses.size() * 100 / admins.size()));

        return responses;
    }

    /**
     * Get single admin by ID with caching
     */
    @Cacheable(value = "admins", key = "#id")
    public AdminResponse getAdminById(Integer id) {
        log.debug("🔍 Single admin lookup - ID: {}", id);
        return adminRepository.findById(id)
                .map(this::safeMapToResponse)
                .orElse(null);
    }

    /**
     * Clear all admin cache entries
     */
    @CacheEvict(value = "admins", allEntries = true)
    public void clearAdminCache() {
        log.info("🧹 Cleared ALL admin cache entries");
    }

    /**
     * Safely map Admin → AdminResponse (handles lazy loading)
     */
    private AdminResponse safeMapToResponse(Admin admin) {
        try {
            Long userId = null;
            try {
                if (admin.getUser() != null && admin.getUser().getId() != null) {
                    userId = admin.getUser().getId();
                }
            } catch (Exception userLoadEx) {
                log.debug("Lazy user load skipped for admin ID: {} - {}", admin.getId(), userLoadEx.getMessage());
            }

            return AdminResponse.builder()
                    .id(admin.getId())
                    .userId(userId != null ? userId.intValue() : null)
                    .favoriteColor(admin.getFavoriteColor())
                    .luckyNumber(admin.getLuckyNumber())
                    .isSuperAdmin(admin.getIsSuperAdmin())
                    .notes(admin.getNotes())
                    .build();

        } catch (Exception e) {
            log.warn("❌ Failed to map admin ID={} to response: {}", admin.getId(), e.getMessage());
            return null;
        }
    }

    @CacheEvict(value = "admins", allEntries = true) // ← CLEARS ALL admin cache
    public AdminResponse updateAdminProfile(Integer id, AdminRequest request) {
        log.info("🔄 Updating admin ID={} with new data", id);

        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found: " + id));

        // Update fields
        admin.setFavoriteColor(request.getFavoriteColor());
        admin.setLuckyNumber(request.getLuckyNumber());
        admin.setIsSuperAdmin(request.getIsSuperAdmin());
        admin.setNotes(request.getNotes());

        Admin saved = adminRepository.save(admin);
        log.info("✅ Admin updated and cache cleared");

        return safeMapToResponse(saved);
    }

}
