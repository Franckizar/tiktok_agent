package com.example.security.Schema.Match;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.example.security.Schema.Dispute.Dispute;
import com.example.security.Schema.MatchResultConfirmation.MatchResultConfirmation;
import com.example.security.Schema.Tournament.Tournament;
import com.example.security.Schema.TournamentRegistration.TournamentRegistration;

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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "matches")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many-to-One: Many matches belong to one tournament
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @Column(nullable = false)
    private Integer round;

    @Column(name = "match_number", nullable = false)
    private Integer matchNumber;

    // Many-to-One: First participant
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant1_id", nullable = false)
    private TournamentRegistration participant1;

    // Many-to-One: Second participant (null = bye)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant2_id")
    private TournamentRegistration participant2;

    // Many-to-One: Winner of the match
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    private TournamentRegistration winner;

    @Column(name = "score_p1")
    private Integer scoreP1;

    @Column(name = "score_p2")
    private Integer scoreP2;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchStatus status;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // One-to-Many: Both players submit result confirmations
    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<MatchResultConfirmation> confirmations = new ArrayList<>();

    // One-to-Many: A match can have disputes raised
    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Dispute> disputes = new ArrayList<>();
}