package com.example.security.intelligence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApifyJobRepository extends JpaRepository<ApifyJob, Long> {

    List<ApifyJob> findByUserIdOrderByRequestedAtDesc(Long userId);

    List<ApifyJob> findByStatus(ApifyJob.JobStatus status);

    List<ApifyJob> findByUserIdAndNicheKeyword(Long userId, String nicheKeyword);
}
