package com.example.security.Users.Player;

import com.example.security.UserRepository;
import com.example.security.Users.User;
import com.example.security.dto.mapper.PlayerMapper;
import com.example.security.dto.request.PlayerRequest;
import com.example.security.dto.response.PlayerResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final UserRepository userRepository;
    private final PlayerMapper playerMapper;

    // ========================================
    // CREATE - Called after admin approves a user as PLAYER
    // ========================================
    @Transactional
    public PlayerResponse create(Long userId, PlayerRequest request) {
        // Auto-detect current user if userId not provided
        if (userId == null) {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            userId = user.getId();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent duplicate player profile
        if (playerRepository.findByUserId(userId).isPresent()) {
            throw new IllegalStateException("Player profile already exists for this user");
        }

        // Check nickname uniqueness
        if (request != null && playerRepository.existsByNickname(request.getNickname())) {
            throw new IllegalStateException("Nickname already taken. Please choose another.");
        }

        Player player = Player.builder()
                .user(user)
                // Mandatory fields
                .nickname(request != null ? request.getNickname() : null)
                .country(request != null ? request.getCountry() : null)
                .platform(request != null ? request.getPlatform() : null)
                .mainGame(request != null ? request.getMainGame() : null)
                .skillLevel(request != null ? request.getSkillLevel() : null)
                // Optional fields
                .gameTag(request != null ? request.getGameTag() : null)
                .rank(request != null ? request.getRank() : null)
                .discordUsername(request != null ? request.getDiscordUsername() : null)
                .twitchChannel(request != null ? request.getTwitchChannel() : null)
                .youtubeChannel(request != null ? request.getYoutubeChannel() : null)
                .bio(request != null ? request.getBio() : null)
                .phone(request != null ? request.getPhone() : null)
                // Profile is incomplete until mandatory fields are filled
                .profileComplete(request != null && isProfileComplete(request))
                .build();

        Player saved = playerRepository.save(player);
        return playerMapper.toResponse(saved);
    }

    // ========================================
    // GET BY USER ID
    // ========================================
    @Transactional(readOnly = true)
    public PlayerResponse findByUserId(Long userId) {
        Player player = playerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Player profile not found"));
        return playerMapper.toResponse(player);
    }

    // ========================================
    // GET CURRENT LOGGED-IN PLAYER PROFILE
    // ========================================
    @Transactional(readOnly = true)
    public PlayerResponse getCurrentPlayerProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Player player = playerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Player profile not found"));

        return playerMapper.toResponse(player);
    }

    // ========================================
    // UPDATE - Called from setup page after first login
    // ========================================
    @Transactional
    public PlayerResponse update(Long userId, PlayerRequest request) {
        Player player = playerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Player profile not found"));

        // Check nickname uniqueness if it changed
        if (!player.getNickname().equals(request.getNickname())
                && playerRepository.existsByNickname(request.getNickname())) {
            throw new IllegalStateException("Nickname already taken. Please choose another.");
        }

        // Update mandatory fields
        player.setNickname(request.getNickname());
        player.setCountry(request.getCountry());
        player.setPlatform(request.getPlatform());
        player.setMainGame(request.getMainGame());
        player.setSkillLevel(request.getSkillLevel());

        // Update optional fields
        player.setGameTag(request.getGameTag());
        player.setRank(request.getRank());
        player.setDiscordUsername(request.getDiscordUsername());
        player.setTwitchChannel(request.getTwitchChannel());
        player.setYoutubeChannel(request.getYoutubeChannel());
        player.setBio(request.getBio());
        player.setPhone(request.getPhone());

        // Mark profile as complete if all mandatory fields are filled
        player.setProfileComplete(isProfileComplete(request));

        Player saved = playerRepository.save(player);
        return playerMapper.toResponse(saved);
    }

    // ========================================
    // HELPER - Check if all mandatory fields are present
    // ========================================
    private boolean isProfileComplete(PlayerRequest request) {
        return request.getNickname() != null && !request.getNickname().isBlank()
                && request.getCountry() != null && !request.getCountry().isBlank()
                && request.getPlatform() != null && !request.getPlatform().isBlank()
                && request.getMainGame() != null && !request.getMainGame().isBlank()
                && request.getSkillLevel() != null && !request.getSkillLevel().isBlank();
    }
}