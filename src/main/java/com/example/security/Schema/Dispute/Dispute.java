// package com.example.security.Schema.Dispute;

// import java.time.LocalDateTime;

// import com.example.security.Schema.Match.Match;
// import com.example.security.Users.User;
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
// @Table(name = "disputes")
// @Data
// @Builder
// @NoArgsConstructor
// @AllArgsConstructor
// public class Dispute {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     // Many-to-One: Many disputes can be raised for one match
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "match_id", nullable = false)
//     private Match match;

//     // Many-to-One: Raised by one player
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "raised_by", nullable = false)
//     private Player raisedBy;

//     @Column(nullable = false, columnDefinition = "TEXT")
//     private String reason;

//     @Enumerated(EnumType.STRING)
//     @Column(nullable = false)
//     private DisputeStatus status;

//     // Many-to-One: Resolved by one admin
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "resolved_by")
//     private User resolvedBy;

//     @Column(name = "resolution_notes", columnDefinition = "TEXT")
//     private String resolutionNotes;

//     @Column(name = "created_at", nullable = false, updatable = false)
//     private LocalDateTime createdAt;

//     @Column(name = "resolved_at")
//     private LocalDateTime resolvedAt;

//     @PrePersist
//     protected void onCreate() {
//         createdAt = LocalDateTime.now();
//     }
// }