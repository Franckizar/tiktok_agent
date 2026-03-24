package com.example.security.intelligence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CompetitorProfileRepository extends JpaRepository<CompetitorProfile, Long> {

    List<CompetitorProfile> findByApifyJobIdOrderByFollowerCountDesc(Long apifyJobId);
}


