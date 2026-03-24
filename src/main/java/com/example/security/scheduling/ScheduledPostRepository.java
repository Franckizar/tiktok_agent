package com.example.security.scheduling;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduledPostRepository extends JpaRepository<ScheduledPost, Long> {

    List<ScheduledPost> findByUserId(Long userId);

    // Used by the scheduler job — finds all posts ready to publish
    @Query("SELECT s FROM ScheduledPost s WHERE s.status = 'PENDING' AND s.scheduledAt <= :now")
    List<ScheduledPost> findPostsDueForPublishing(LocalDateTime now);

    List<ScheduledPost> findByUserIdAndStatus(Long userId, ScheduledPost.PostStatus status);
}