

// --- AiSuggestionRepository.java ---
package com.example.security.intelligence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AiSuggestionRepository extends JpaRepository<AiSuggestion, Long> {

    List<AiSuggestion> findByUserIdOrderByGeneratedAtDesc(Long userId);

    List<AiSuggestion> findByUserIdAndSuggestionType(Long userId, AiSuggestion.SuggestionType type);

    List<AiSuggestion> findByApifyJobId(Long apifyJobId);

    List<AiSuggestion> findByUserIdAndIsAppliedFalseOrderByConfidenceScoreDesc(Long userId);
}