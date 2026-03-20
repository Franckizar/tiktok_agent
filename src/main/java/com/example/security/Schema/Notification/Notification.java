// package com.example.security.Schema.Notification;

// import java.time.LocalDateTime;

// import com.example.security.Users.User;

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
// @Table(name = "notifications")
// @Data
// @Builder
// @NoArgsConstructor
// @AllArgsConstructor
// public class Notification {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     // Many-to-One: Many notifications belong to one user
//     @ManyToOne(fetch = FetchType.LAZY)
//     @JoinColumn(name = "user_id", nullable = false)
//     private User user;

//     @Enumerated(EnumType.STRING)
//     @Column(nullable = false)
//     private NotificationType type;

//     @Column(nullable = false)
//     private String title;

//     @Column(nullable = false, columnDefinition = "TEXT")
//     private String message;

//     @Builder.Default
//     @Column(name = "is_read")
//     private Boolean isRead = false;

//     @Column(name = "reference_id")
//     private Long referenceId;

//     @Column(name = "created_at", nullable = false, updatable = false)
//     private LocalDateTime createdAt;

//     @PrePersist
//     protected void onCreate() {
//         createdAt = LocalDateTime.now();
//     }
// }