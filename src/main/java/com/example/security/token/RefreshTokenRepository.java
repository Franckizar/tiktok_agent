package com.example.security.token;

import com.example.security.Users.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    
    // ✅ FIXED: Integer → Long
    Optional<RefreshToken> findByUserIdAndRevokedFalse(Long userId);
    
    // ✅ FIXED: Integer → Long  
    void deleteByUserId(Long userId);
}
