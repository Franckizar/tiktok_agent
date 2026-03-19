package com.example.security.Users.Player;

import com.example.security.Schema.Dispute.Dispute;

import com.example.security.Schema.PlayerGameRanking.PlayerGameRanking;
import com.example.security.Schema.SeasonOverallRanking.SeasonOverallRanking;
import com.example.security.Schema.TournamentRegistration.TournamentRegistration;
import com.example.security.Schema.Wallet.Wallet;
import com.example.security.Users.User;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "player_profiles")
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ========================================
    // USER RELATION
    // ========================================

    // One-to-One: Each player profile belongs to one user
    @OneToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // ========================================
    // MANDATORY FIELDS
    // ========================================

    @Column(unique = true, nullable = false)
    private String nickname;

    @Column(nullable = false)
    private String country;

    @Column(nullable = false)
    private String platform;        // PC, PlayStation, Xbox, Mobile

    @Column(name = "main_game", nullable = false)
    private String mainGame;        // Will be replaced by Game entity later

    @Column(name = "skill_level", nullable = false)
    private String skillLevel;      // BEGINNER, INTERMEDIATE, ADVANCED, PRO

    // ========================================
    // OPTIONAL FIELDS
    // ========================================

    @Column(name = "game_tag")
    private String gameTag;

    private String rank;

    @Column(name = "discord_username")
    private String discordUsername;

    @Column(name = "twitch_channel")
    private String twitchChannel;

    @Column(name = "youtube_channel")
    private String youtubeChannel;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String phone;

    // ========================================
    // STATS
    // ========================================

    @Builder.Default
    @Column(name = "total_games_played")
    private Integer totalGamesPlayed = 0;

    @Builder.Default
    private Integer wins = 0;

    @Builder.Default
    private Integer losses = 0;

    @Builder.Default
    private Integer points = 0;

    // ========================================
    // STATUS
    // ========================================

    @Builder.Default
    private boolean active = true;

    @Builder.Default
    @Column(name = "profile_complete")
    private boolean profileComplete = false;

    // ========================================
    // RELATIONS
    // ========================================

    // One-to-One: Each player has one wallet
    @OneToOne(mappedBy = "player", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Wallet wallet;

    // One-to-Many: A player registers for many tournaments
    @OneToMany(mappedBy = "player", fetch = FetchType.LAZY)
    @Builder.Default
    private List<TournamentRegistration> registrations = new ArrayList<>();

    // One-to-Many: A player has rankings per game per season
    @OneToMany(mappedBy = "player", fetch = FetchType.LAZY)
    @Builder.Default
    private List<PlayerGameRanking> gameRankings = new ArrayList<>();

    // One-to-Many: A player has one overall ranking per season
    @OneToMany(mappedBy = "player", fetch = FetchType.LAZY)
    @Builder.Default
    private List<SeasonOverallRanking> seasonRankings = new ArrayList<>();

    // One-to-Many: A player can raise disputes
    @OneToMany(mappedBy = "raisedBy", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Dispute> disputes = new ArrayList<>();
}