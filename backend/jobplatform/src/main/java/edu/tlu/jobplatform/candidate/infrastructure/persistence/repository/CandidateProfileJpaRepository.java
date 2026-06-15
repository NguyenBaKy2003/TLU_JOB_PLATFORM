package edu.tlu.jobplatform.candidate.infrastructure.persistence.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import edu.tlu.jobplatform.application.infrastructure.persistence.projection.CandidateInfoProjection;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile.JobSearchStatus;
import edu.tlu.jobplatform.candidate.infrastructure.persistence.entity.CandidateProfileJpaEntity;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CandidateProfileJpaRepository
    extends JpaRepository<CandidateProfileJpaEntity, UUID> {

  // ── Finders
  @EntityGraph(attributePaths = {
      "skills",
      "experiences",
      "educations",
      "desiredJobs",
      "desiredJobs.levels"
  })
  @Query("""
      SELECT DISTINCT p FROM CandidateProfileJpaEntity p
      WHERE p.jobSearchStatus IN :statuses
        AND p.isActive = true
      """)
  Page<CandidateProfileJpaEntity> findByJobSearchStatusIn(
      @Param("statuses") List<JobSearchStatus> statuses,
      Pageable pageable);

  /**
   * Fetch đầy đủ collections qua @EntityGraph — tránh Cartesian product
   * của JOIN FETCH nhiều List cùng lúc.
   */
  @EntityGraph(attributePaths = {
      "skills", "experiences", "educations",
      "languages", "socialLinks", "benefits",
      "desiredJobs",
      "desiredJobs.contractTypes",
      "desiredJobs.levels"
  })
  @Query("SELECT p FROM CandidateProfileJpaEntity p WHERE p.userId = :userId")
  Optional<CandidateProfileJpaEntity> findByUserIdWithDetails(@Param("userId") UUID userId);

  /**
   * Tìm theo profileUrl — dùng khi check duplicate trong ProfileUrlService.
   * Không cần fetch collections, chỉ cần scalar fields để lấy id.
   */
  @Query("SELECT p FROM CandidateProfileJpaEntity p WHERE p.profileUrl = :profileUrl")
  Optional<CandidateProfileJpaEntity> findByProfileUrl(@Param("profileUrl") String profileUrl);

  // ── Existence checks ──

  boolean existsByUserId(UUID userId);

  /**
   * Dùng trong ProfileUrlService.generateSlug() để check trùng
   * và validateAndBuildUrl() để ngăn user dùng slug đã có.
   */
  boolean existsByProfileUrl(String profileUrl);

  List<CandidateProfileJpaEntity> findAllByUserIdIn(Collection<UUID> userIds);

  @Query("""
      SELECT p.id FROM CandidateProfileJpaEntity p
      WHERE p.jobSearchStatus IN :statuses
        AND p.isActive = true
      """)
  List<UUID> findIdsByJobSearchStatusIn(
      @Param("statuses") List<JobSearchStatus> statuses,
      Pageable pageable);

  // Bước 2: fetch đầy đủ collections + join users theo IDs
  @EntityGraph(attributePaths = {
      "skills",
      "experiences",
      "educations",
      "languages",
      "socialLinks",
      "benefits",
      "desiredJobs",
      "desiredJobs.levels",
      "desiredJobs.contractTypes"
  })
  @Query("""
      SELECT DISTINCT p FROM CandidateProfileJpaEntity p
      WHERE p.id IN :ids
      """)
  List<CandidateProfileJpaEntity> findAiPoolWithDetails(
      @Param("ids") List<UUID> ids);

  @Query("""
      SELECT
          p.userId       AS userId,
          p.firstName    AS firstName,
          p.lastName     AS lastName,
          p.phone        AS phone,
          p.avatarUrl    AS avatarUrl,
          p.boostedUntil AS boostedUntil,
          u.email        AS email
      FROM CandidateProfileJpaEntity p
      JOIN UserJpaEntity u ON u.id = p.userId
      WHERE p.userId IN :userIds
        AND p.isActive = true
      """)
  List<CandidateInfoProjection> findCandidateInfoByUserIds(
      @Param("userIds") Collection<UUID> userIds);

}