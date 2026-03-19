package com.example.security.Users.SuperAdmin;

import com.example.security.Users.User;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "superadmin_profiles")
public class SuperAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link back to the main User account
    @OneToOne
    @JsonIgnore
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ========================================
    // SYSTEM INFO
    // ========================================

    @Column(nullable = false)
    private String systemName;          // Name of the platform/app being managed

    @Column(unique = true, nullable = false)
    private String contactEmail;        // Official system contact email

    private String contactPhone;        // Official contact phone

    // ========================================
    // AUDIT
    // ========================================

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(); // When SuperAdmin was created

    private LocalDateTime lastLoginAt;  // Last time SuperAdmin logged in

    // ========================================
    // STATUS
    // ========================================

    @Builder.Default
    private boolean active = true;
}