package com.example.security.intelligence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HashtagTrendRepository extends JpaRepository<HashtagTrend, Long> {

    List<HashtagTrend> findByApifyJobIdOrderByAvgViewsDesc(Long apifyJobId);

    List<HashtagTrend> findByApifyJobIdAndTrendDirection(Long apifyJobId, HashtagTrend.TrendDirection direction);
}