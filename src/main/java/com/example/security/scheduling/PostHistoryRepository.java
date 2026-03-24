package com.example.security.scheduling;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostHistoryRepository extends JpaRepository<PostHistory, Long> {

    List<PostHistory> findByUserIdOrderByPostedAtDesc(Long userId);

    Optional<PostHistory> findByTiktokVideoId(String tiktokVideoId);

    boolean existsByTiktokVideoId(String tiktokVideoId);
}