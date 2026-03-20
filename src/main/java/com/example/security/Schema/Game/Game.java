// package com.example.security.Schema.Game;

// import java.time.LocalDateTime;
// import java.util.ArrayList;
// import java.util.List;

// import com.example.security.Schema.PlayerGameRanking.PlayerGameRanking;
// import com.example.security.Schema.Team.Team;
// import com.example.security.Schema.Tournament.Tournament;
// import com.example.security.Users.Player.Player;

// import jakarta.persistence.Column;
// import jakarta.persistence.Entity;
// import jakarta.persistence.EnumType;
// import jakarta.persistence.Enumerated;
// import jakarta.persistence.FetchType;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.GenerationType;
// import jakarta.persistence.Id;
// import jakarta.persistence.OneToMany;
// import jakarta.persistence.PrePersist;
// import jakarta.persistence.Table;
// import lombok.AllArgsConstructor;
// import lombok.Builder;
// import lombok.Data;
// import lombok.NoArgsConstructor;

// @Entity
// @Table(name = "games")
// @Data
// @Builder
// @NoArgsConstructor
// @AllArgsConstructor
// public class Game {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @Column(unique = true, nullable = false)
//     private String name;

//     @Column(columnDefinition = "TEXT")
//     private String description;

//     @Column(name = "logo_path")
//     private String logoPath;

//     @Enumerated(EnumType.STRING)
//     @Column(nullable = false)
//     private GamePlatform platform;

//     @Column(name = "is_active")
//     private Boolean isActive = true;

//     @Column(name = "created_at", nullable = false, updatable = false)
//     private LocalDateTime createdAt;

//     // One-to-Many: A game has many tournaments
//     @OneToMany(mappedBy = "game", fetch = FetchType.LAZY)
//     @Builder.Default
//     private List<Tournament> tournaments = new ArrayList<>();

//     // One-to-Many: A game has many player rankings
//     @OneToMany(mappedBy = "game", fetch = FetchType.LAZY)
//     @Builder.Default
//     private List<PlayerGameRanking> rankings = new ArrayList<>();

//     // One-to-Many: A game is the main game for many players
//     @OneToMany(mappedBy = "mainGame", fetch = FetchType.LAZY)
//     @Builder.Default
//     private List<Player> players = new ArrayList<>();

//     // One-to-Many: A game has many teams
//     @OneToMany(mappedBy = "game", fetch = FetchType.LAZY)
//     @Builder.Default
//     private List<Team> teams = new ArrayList<>();

//     @PrePersist
//     protected void onCreate() {
//         createdAt = LocalDateTime.now();
//     }
// }