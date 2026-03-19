package com.example.security.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerResponse {

    private Long id;
    private Long userId;

    // ========================================
    // MANDATORY FIELDS
    // ========================================

    private String nickname;
    private String country;
    private String platform;
    private String mainGame;
    private String skillLevel;

    // ========================================
    // OPTIONAL FIELDS
    // ========================================

    private String gameTag;
    private String rank;
    private String discordUsername;
    private String twitchChannel;
    private String youtubeChannel;
    private String bio;
    private String phone;

    // Profile image comes from User entity
    private String logoPath;

    // ========================================
    // STATS
    // ========================================

    private Integer totalGamesPlayed;
    private Integer wins;
    private Integer losses;
    private Integer points;

    // ========================================
    // STATUS
    // ========================================

    private boolean active;
    private boolean profileComplete;
}