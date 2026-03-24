package com.example.security.analytics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnalyticsSnapshotRepository extends JpaRepository<AnalyticsSnapshot, Long> {

    List<AnalyticsSnapshot> findByUserIdOrderBySnapshotAtDesc(Long userId);

    // All snapshots for one video (to build growth curve)
    List<AnalyticsSnapshot> findByTiktokVideoIdOrderBySnapshotAtAsc(String tiktokVideoId);

    // Latest snapshot per video for dashboard summary
    List<AnalyticsSnapshot> findTop10ByUserIdOrderByViewsDesc(Long userId);
}