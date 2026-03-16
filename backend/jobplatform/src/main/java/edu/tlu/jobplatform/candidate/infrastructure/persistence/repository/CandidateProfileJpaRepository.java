package edu.tlu.jobplatform.candidate.infrastructure.persistence.repository;

import edu.tlu.jobplatform.candidate.infrastructure.persistence.entity.CandidateProfileJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateProfileJpaRepository
        extends JpaRepository<CandidateProfileJpaEntity, UUID> {

    @Query("""
            SELECT p FROM CandidateProfileJpaEntity p
            LEFT JOIN FETCH p.experiences
            LEFT JOIN FETCH p.educations
            LEFT JOIN FETCH p.skills
            WHERE p.userId = :userId
            """)
    Optional<CandidateProfileJpaEntity> findByUserIdWithDetails(
            @Param("userId") UUID userId);

    Optional<CandidateProfileJpaEntity> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);
}