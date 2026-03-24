

// --- NicheReportRepository.java ---
package com.example.security.intelligence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface NicheReportRepository extends JpaRepository<NicheReport, Long> {

    List<NicheReport> findByUserIdOrderByGeneratedAtDesc(Long userId);

    Optional<NicheReport> findByApifyJobId(Long apifyJobId);

    List<NicheReport> findByUserIdAndNiche(Long userId, String niche);
}
