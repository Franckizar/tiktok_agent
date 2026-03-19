package com.example.security.Schema.Team;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// import org.hibernate.annotations.Table;

import com.example.security.Schema.Game.Game;
import com.example.security.Schema.TeamMember.TeamMember;
import com.example.security.Schema.TournamentRegistration.TournamentRegistration;
import com.example.security.Users.Player.Player;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "teams")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Team {


    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(unique = true, nullable = false)
    private String name;


    @Column(unique = true, nullable = false)
    private String tag;


    @Column(name = "logo_path")
    private String logoPath;


    @Column(columnDefinition = "TEXT")
    private String description;


    // ✅ Many-to-One: Many teams can have same game
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id")
    private Game game;


    // ✅ Many-to-One: One player is captain of the team
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "captain_id")
    private Player captain;


    @Column(name = "is_active")
    private Boolean isActive = true;


    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;


    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;


    // ✅ One-to-Many: A team has many members over time
    @OneToMany(mappedBy = "team", fetch = FetchType.LAZY)
    private List<TeamMember> members = new ArrayList<>();


    // ✅ One-to-Many: A team registers in many tournaments
    @OneToMany(mappedBy = "team", fetch = FetchType.LAZY)
    private List<TournamentRegistration> registrations = new ArrayList<>();


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
