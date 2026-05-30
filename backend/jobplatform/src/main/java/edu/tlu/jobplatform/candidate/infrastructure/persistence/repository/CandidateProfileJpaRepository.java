package edu.tlu.jobplatform.candidate.infrastructure.persistence.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import edu.tlu.jobplatform.candidate.infrastructure.persistence.entity.CandidateProfileJpaEntity;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CandidateProfileJpaRepository
                extends JpaRepository<CandidateProfileJpaEntity, UUID> {

        // ── Finders

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
}