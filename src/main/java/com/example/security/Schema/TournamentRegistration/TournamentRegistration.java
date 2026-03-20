// package com.example.security.Schema.TournamentRegistration;

// import java.time.LocalDateTime;

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
// import jakarta.persistence.JoinColumn;
// import jakarta.persistence.ManyToOne;
// import jakarta.persistence.PrePersist;
// import jakarta.persistence.Table;
// import lombok.AllArgsConstructor;
// import lombok.Builder;
// import lombok.Data;
// import lombok.NoArgsConstructor;

// @Entity
// @Table(name = "tournament_registrations")
// @Data
// @Builder
// @NoArgsConstructor
// @AllArgsConstructor
// public class TournamentRegistration {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     // Many-to-One: Many registrations belong to one tournament
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "tournament_id", nullable = false)
//     private Tournament tournament;

//     // Many-to-One: A player registration (null if team)
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "player_id")
//     private Player player;

//     // Many-to-One: A team registration (null if individual)
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "team_id")
//     private Team team;

//     @Enumerated(EnumType.STRING)
//     @Column(nullable = false)
//     private RegistrationStatus status;

//     @Column(name = "registered_at", nullable = false)
//     private LocalDateTime registeredAt;

//     private Integer seed;

//     @Builder.Default
//     @Column(name = "checked_in")
//     private Boolean checkedIn = false;

//     @Column(name = "checked_in_at")
//     private LocalDateTime checkedInAt;

//     @PrePersist
//     protected void onCreate() {
//         registeredAt = LocalDateTime.now();
//     }
// }