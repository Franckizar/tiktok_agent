package com.example.security.Users.Admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import com.example.security.auth.Authentication.AuthenticationService;
import com.example.security.dto.response.PageResponse;
import com.example.security.dto.response.UserResponse;

import java.util.List;

@Slf4j
@RestController
// @RequestMapping("/api/test/admin")
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final AuthenticationService authenticationService;

    /**
     * Get all admin profiles (ADMIN or SUPER_ADMIN only)
     */
    @GetMapping("/all")

    public ResponseEntity<List<AdminResponse>> getAllAdmins() {
        log.info("📋 /api/test/admin/all - Admin lookup requested");
        List<AdminResponse> admins = adminService.getAllAdminProfiles();
        log.info("📤 Returning {} admin profiles", admins.size());
        return ResponseEntity.ok(admins);
    }

    /**
     * Get single admin by ID (ADMIN or SUPER_ADMIN only)
     */
    @GetMapping("/{id}")

    public ResponseEntity<AdminResponse> getAdmin(@PathVariable Integer id) {
        log.info("👤 /api/test/admin/{} - Single admin lookup", id);
        AdminResponse admin = adminService.getAdminById(id);

        if (admin == null) {
            log.warn("❌ Admin not found - ID: {}", id);
            return ResponseEntity.notFound().build();
        }

        // log.info("✅ Admin found - ID: {}, SuperAdmin: {}", id, admin.isSuperAdmin());
        return ResponseEntity.ok(admin);
    }

    /**
     * Clear admin cache (SUPER_ADMIN only)
     */
    @PostMapping("/clear-cache")

    public ResponseEntity<String> clearCache() {
        log.info("🧹 /api/test/admin/clear-cache - Cache eviction requested");
        adminService.clearAdminCache();
        return ResponseEntity.ok("Admin cache cleared successfully");
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<AdminResponse> updateAdmin(
            @PathVariable Integer id,
            @RequestBody AdminRequest request) {
        log.info("🔄 /api/test/admin/update/{} - Admin update requested", id);
        AdminResponse updated = adminService.updateAdminProfile(id, request);
        log.info("✨ Returning updated admin profile");
        return ResponseEntity.ok(updated);
    }

    @Cacheable(value = "pendingUsers", key = "#page + '-' + #size")
    @GetMapping("/pending-users")
    public ResponseEntity<PageResponse<UserResponse>> getPendingUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("=== ADMIN: FETCH PENDING USERS ===");
        log.info("Page: {}, Size: {}", page, size);

        try {
            PageResponse<UserResponse> response = authenticationService.getPendingUsers(page, size);

            log.info("Returning {} pending users", response.getContent().size());
            log.info("=== FETCH COMPLETE ===");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to fetch pending users", e);
            log.info("=== FETCH FAILED ===");
            throw e;
        }
    }

}
