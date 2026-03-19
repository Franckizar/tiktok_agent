package com.example.security.Users.SuperAdmin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SuperAdminRepository extends JpaRepository<SuperAdmin, Long> {

    Optional<SuperAdmin> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}