package com.example.security.Schema.Season;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.example.security.Schema.PlayerGameRanking.PlayerGameRanking;
import com.example.security.Schema.SeasonOverallRanking.SeasonOverallRanking;
import com.example.security.Schema.Tournament.Tournament;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "seasons")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Season {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeasonStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // One-to-Many: A season has many tournaments
    @OneToMany(mappedBy = "season", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Tournament> tournaments = new ArrayList<>();

    // One-to-Many: A season has many per-game rankings
    @OneToMany(mappedBy = "season", fetch = FetchType.LAZY)
    @Builder.Default
    private List<PlayerGameRanking> gameRankings = new ArrayList<>();

    // One-to-Many: A season has many overall rankings
    @OneToMany(mappedBy = "season", fetch = FetchType.LAZY)
    @Builder.Default
    private List<SeasonOverallRanking> overallRankings = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}