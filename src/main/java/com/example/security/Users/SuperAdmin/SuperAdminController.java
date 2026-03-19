package com.example.security.Users.SuperAdmin;

import com.example.security.dto.request.SuperAdminRequest;
import com.example.security.dto.response.SuperAdminResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/superadmin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    // ========================================
    // GET MY PROFILE
    // ========================================
    @GetMapping("/profile/me")
    public ResponseEntity<SuperAdminResponse> getMyProfile() {
        return ResponseEntity.ok(superAdminService.getCurrentProfile());
    }

    // ========================================
    // UPDATE MY PROFILE
    // ========================================
    @PutMapping("/profile/me")
    public ResponseEntity<SuperAdminResponse> updateMyProfile(
            @Valid @RequestBody SuperAdminRequest request) {
        return ResponseEntity.ok(superAdminService.update(request));
    }
}