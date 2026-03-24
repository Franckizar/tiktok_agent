package com.example.security;

import com.example.security.Users.Role;
import com.example.security.Users.User;
import com.example.security.Users.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // ========================================
    // BASIC QUERIES
    // ========================================

    Optional<User> findByEmail(String email);

    long count();

    // ========================================
    // TIKTOK QUERY
    // ========================================

    Optional<User> findByTiktokId(String tiktokId);

    // ========================================
    // ROLE QUERIES
    // ========================================

    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r = :role")
    long countByRole(@Param("role") Role role);

    // ========================================
    // EMAIL SEARCH
    // ========================================

    @Query("SELECT u FROM User u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))")
    List<User> findByEmailContainingIgnoreCase(@Param("email") String email);

    // ========================================
    // STATUS QUERIES
    // ========================================

    Page<User> findByStatus(UserStatus status, Pageable pageable);

    List<User> findByStatus(UserStatus status);

    List<User> findByTiktokConnectedTrue();
}