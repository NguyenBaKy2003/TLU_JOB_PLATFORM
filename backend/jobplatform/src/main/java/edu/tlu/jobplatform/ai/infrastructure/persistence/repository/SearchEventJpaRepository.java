package edu.tlu.jobplatform.ai.infrastructure.persistence.repository;

import edu.tlu.jobplatform.ai.infrastructure.persistence.entity.SearchEventJpaEntity;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SearchEventJpaRepository
    extends JpaRepository<SearchEventJpaEntity, UUID> {

  @Query("""
      SELECT e.keyword FROM SearchEventJpaEntity e
      WHERE e.candidateId = :candidateId
        AND e.eventType   = edu.tlu.jobplatform.ai.domain.model.SearchEvent.EventType.SEARCH_QUERY
        AND e.occurredAt >= :since
        AND e.keyword    IS NOT NULL
      ORDER BY e.occurredAt DESC
      """)
  List<String> findKeywordsByCandidate(
      @Param("candidateId") UUID candidateId,
      @Param("since") LocalDateTime since,
      Pageable pageable);

  @Query("""
      SELECT j.title FROM SearchEventJpaEntity e
      JOIN JobPostJpaEntity j ON j.id = e.jobPostId
      WHERE e.candidateId = :candidateId
        AND e.eventType   = edu.tlu.jobplatform.ai.domain.model.SearchEvent.EventType.JOB_VIEW
        AND e.occurredAt >= :since
        AND e.jobPostId  IS NOT NULL
      ORDER BY e.dwellSeconds DESC
      """)
  List<String> findTopViewedJobTitles(
      @Param("candidateId") UUID candidateId,
      @Param("since") LocalDateTime since,
      Pageable pageable); //

  @Query(value = """
      SELECT j.title FROM applications a
      JOIN job_posts j ON j.id = a.job_post_id
      WHERE a.candidate_id = :candidateId
      ORDER BY a.applied_at DESC
      """, nativeQuery = true)
  List<String> findAppliedJobTitles(@Param("candidateId") UUID candidateId);

  @Query("""
      SELECT j.title FROM SearchEventJpaEntity e
      JOIN JobPostJpaEntity j ON j.id = e.jobPostId
      WHERE e.candidateId = :candidateId
        AND e.eventType   = edu.tlu.jobplatform.ai.domain.model.SearchEvent.EventType.JOB_SAVE
      ORDER BY e.occurredAt DESC
      """)
  List<String> findSavedJobTitles(@Param("candidateId") UUID candidateId);

  @Query("""
      SELECT e.keyword FROM SearchEventJpaEntity e
      WHERE e.candidateId = :candidateId
        AND e.eventType   = edu.tlu.jobplatform.ai.domain.model.SearchEvent.EventType.SEARCH_QUERY
        AND e.keyword    IS NOT NULL
      ORDER BY e.occurredAt DESC
      """)
  List<String> findRecentKeywords(
      @Param("candidateId") UUID candidateId,
      Pageable pageable);
}