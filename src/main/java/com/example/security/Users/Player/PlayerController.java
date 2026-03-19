package com.example.security.Users.Player;

import com.example.security.dto.request.PlayerRequest;
import com.example.security.dto.response.PlayerResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/player")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    // ========================================
    // CREATE PROFILE - Called after admin approval
    // ========================================
    @PostMapping("/profile")
    public ResponseEntity<PlayerResponse> createProfile(
            @Valid @RequestBody PlayerRequest request) {
        return ResponseEntity.ok(playerService.create(null, request));
    }

    // ========================================
    // GET PROFILE BY USER ID
    // ========================================
    @GetMapping("/profile/{userId}")
    public ResponseEntity<PlayerResponse> getProfile(
            @PathVariable Long userId) {
        return ResponseEntity.ok(playerService.findByUserId(userId));
    }

    // ========================================
    // GET MY PROFILE - Current logged-in player
    // ========================================
    @GetMapping("/profile/me")
    public ResponseEntity<PlayerResponse> getMyProfile() {
        return ResponseEntity.ok(playerService.getCurrentPlayerProfile());
    }

    // ========================================
    // UPDATE PROFILE - Setup page after first login
    // ========================================
    @PutMapping("/profile/{userId}")
    public ResponseEntity<PlayerResponse> updateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody PlayerRequest request) {
        return ResponseEntity.ok(playerService.update(userId, request));
    }
}