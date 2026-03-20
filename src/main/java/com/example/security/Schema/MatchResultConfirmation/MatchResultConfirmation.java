// package com.example.security.Schema.MatchResultConfirmation;

// import java.time.LocalDateTime;

// // import org.hibernate.annotations.Table;

// import com.example.security.Schema.Match.Match;
// import com.example.security.Schema.TournamentRegistration.TournamentRegistration;

// import jakarta.persistence.Column;
// import jakarta.persistence.Entity;
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
// @Table(name = "match_result_confirmations")
// @Data
// @Builder
// @NoArgsConstructor
// @AllArgsConstructor
// public class MatchResultConfirmation {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     // ✅ Many-to-One: Many confirmations belong to one match
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "match_id", nullable = false)
//     private Match match;

//     // ✅ Many-to-One: Submitted by one participant
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "participant_id", nullable = false)
//     private TournamentRegistration participant;

//     @Column(name = "score_p1_reported", nullable = false)
//     private Integer scoreP1Reported;

//     @Column(name = "score_p2_reported", nullable = false)
//     private Integer scoreP2Reported;

//     @Column(name = "confirmed_at", nullable = false)
//     private LocalDateTime confirmedAt;

//     @PrePersist
//     protected void onCreate() {
//         confirmedAt = LocalDateTime.now();
//     }
// }
