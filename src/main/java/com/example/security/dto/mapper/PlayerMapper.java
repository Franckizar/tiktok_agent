package com.example.security.dto.mapper;

import com.example.security.Users.Player.Player;
import com.example.security.dto.response.PlayerResponse;
import org.springframework.stereotype.Component;

@Component
public class PlayerMapper {

    public PlayerResponse toResponse(Player player) {
        return PlayerResponse.builder()
                .id(player.getId())
                .userId(player.getUser().getId())
                // Mandatory
                .nickname(player.getNickname())
                .country(player.getCountry())
                .platform(player.getPlatform())
                .mainGame(player.getMainGame())
                .skillLevel(player.getSkillLevel())
                // Optional
                .gameTag(player.getGameTag())
                .rank(player.getRank())
                .discordUsername(player.getDiscordUsername())
                .twitchChannel(player.getTwitchChannel())
                .youtubeChannel(player.getYoutubeChannel())
                .bio(player.getBio())
                .phone(player.getPhone())
                // Profile image from User entity
                .logoPath(player.getUser().getLogoPath())
                // Stats
                .totalGamesPlayed(player.getTotalGamesPlayed())
                .wins(player.getWins())
                .losses(player.getLosses())
                .points(player.getPoints())
                // Status
                .active(player.isActive())
                .profileComplete(player.isProfileComplete())
                .build();
    }
}