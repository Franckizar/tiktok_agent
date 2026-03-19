package com.example.security.Schema.PlayerGameRanking;

import java.time.LocalDateTime;

// import org.hibernate.annotations.Table;

import com.example.security.Schema.Game.Game;
import com.example.security.Schema.Season.Season;
import com.example.security.Users.Player.Player;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "player_game_rankings", uniqueConstraints = @UniqueConstraint(columnNames = { "player_id", "game_id",
        "season_id" }))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerGameRanking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ Many-to-One: Many rankings belong to one player
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    // ✅ Many-to-One: Many rankings belong to one game
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    // ✅ Many-to-One: Many rankings belong to one season
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "season_id", nullable = false)
    private Season season;

    @Column(nullable = false)
    private Integer points = 0;

    @Column(nullable = false)
    private Integer wins = 0;

    @Column(nullable = false)
    private Integer losses = 0;

    @Column(name = "tournaments_played")
    private Integer tournamentsPlayed = 0;

    @Column(name = "tournaments_won")
    private Integer tournamentsWon = 0;

    @Column(name = "rank_position")
    private Integer rankPosition;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
