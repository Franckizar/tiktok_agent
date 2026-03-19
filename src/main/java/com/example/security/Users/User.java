package com.example.security.Users;

import com.example.security.Schema.Notification.Notification;
import com.example.security.Users.Player.Player;
import com.example.security.Users.SuperAdmin.SuperAdmin;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstname;
    private String lastname;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    @Column(name = "logo_path")
    private String logoPath;

    @Builder.Default
    @Column(name = "token_version", columnDefinition = "int default 0")
    private Integer tokenVersion = 0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", length = 20)
    private UserStatus status = UserStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role defaultRole = Role.UNREG;

    @Column(name = "subscription_expires_at")
    private LocalDateTime subscriptionExpiresAt;

    // ========================================
    // ROLES
    // ========================================
    @ElementCollection(targetClass = Role.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    @Builder.Default
    private List<Role> roles = new ArrayList<>();

    // ========================================
    // RELATIONS
    // ========================================

    // One-to-One: User has one Player profile
    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonBackReference
    private Player playerProfile;

    // One-to-One: User has one SuperAdmin profile
    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonBackReference
    private SuperAdmin superAdminProfile;

    // One-to-Many: User receives many notifications
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Notification> notifications = new ArrayList<>();

    // ========================================
    // HELPER METHODS
    // ========================================

    public void incrementTokenVersion() {
        this.tokenVersion = (this.tokenVersion == null) ? 1 : this.tokenVersion + 1;
    }

    public void addRole(Role role) {
        if (!roles.contains(role)) {
            roles.add(role);
        }
    }

    // ========================================
    // SPRING SECURITY
    // ========================================

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> {
                    String roleName = role.name();
                    if (roleName.startsWith("ROLE_")) {
                        return new SimpleGrantedAuthority(roleName);
                    } else {
                        return new SimpleGrantedAuthority("ROLE_" + roleName);
                    }
                })
                .toList();
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isEnabled() {
        return status == UserStatus.ACTIVE;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != UserStatus.BANNED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
}