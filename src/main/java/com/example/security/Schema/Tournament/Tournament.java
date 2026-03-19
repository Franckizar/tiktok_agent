package com.example.security.Schema.Tournament;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.example.security.Schema.Game.Game;
import com.example.security.Schema.Location.Location;
import com.example.security.Schema.Match.Match;
import com.example.security.Schema.Season.Season;
import com.example.security.Schema.TournamentRegistration.TournamentRegistration;
import com.example.security.Users.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tournaments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Many-to-One: Many tournaments belong to one season
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "season_id", nullable = false)
    private Season season;

    // Many-to-One: Many tournaments use one game
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    // Many-to-One: Many tournaments happen at one location
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TournamentFormat format;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TournamentStatus status;

    @Column(name = "max_participants", nullable = false)
    private Integer maxParticipants;

    @Builder.Default
    @Column(name = "entry_fee", precision = 10, scale = 2)
    private BigDecimal entryFee = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "prize_pool", precision = 10, scale = 2)
    private BigDecimal prizePool = BigDecimal.ZERO;

    @Column(name = "registration_start", nullable = false)
    private LocalDateTime registrationStart;

    @Column(name = "registration_end", nullable = false)
    private LocalDateTime registrationEnd;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    // Many-to-One: Created by one admin user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // One-to-Many: A tournament has many registrations
    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<TournamentRegistration> registrations = new ArrayList<>();

    // One-to-Many: A tournament has many matches
    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Match> matches = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}