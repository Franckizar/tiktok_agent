package com.example.security.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PlayerRequest {

    // ========================================
    // MANDATORY FIELDS
    // ========================================

    @NotBlank(message = "Nickname is required")
    private String nickname;

    @NotBlank(message = "Country is required")
    private String country;

    @NotBlank(message = "Platform is required")
    private String platform;

    @NotBlank(message = "Main game is required")
    private String mainGame;

    @NotBlank(message = "Skill level is required")
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
}