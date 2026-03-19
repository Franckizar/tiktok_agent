package com.example.security;

import com.example.security.Users.PasswordResetToken;
import com.example.security.Users.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    
    // ✅ FIXED: Integer → Long
    Optional<PasswordResetToken> findByUserId(Long userId);
    
    // ✅ deleteByUser() is fine - it takes User entity
    void deleteByUser(User user);
}
