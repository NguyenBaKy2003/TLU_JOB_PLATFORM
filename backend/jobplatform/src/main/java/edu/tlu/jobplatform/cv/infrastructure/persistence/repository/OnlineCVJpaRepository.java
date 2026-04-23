package edu.tlu.jobplatform.cv.infrastructure.persistence.repository;

import edu.tlu.jobplatform.cv.infrastructure.persistence.entity.OnlineCVJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OnlineCVJpaRepository extends JpaRepository<OnlineCVJpaEntity, UUID> {

        List<OnlineCVJpaEntity> findAllByCandidateId(UUID candidateId);

        Optional<OnlineCVJpaEntity> findBySlug(String slug);

        boolean existsBySlug(String slug);

        long countByCandidateId(UUID candidateId);

        /**
         * Fetch CV + sections trong 1 query (tránh N+1).
         * Dùng khi cần render CV đầy đủ (export, view detail).
         */
        @Query("""
                        SELECT DISTINCT cv FROM OnlineCVJpaEntity cv
                        LEFT JOIN FETCH cv.sections
                        WHERE cv.id = :id
                        """)
        Optional<OnlineCVJpaEntity> findByIdWithSections(@Param("id") UUID id);

        @Query("""
                        SELECT DISTINCT cv FROM OnlineCVJpaEntity cv
                        LEFT JOIN FETCH cv.sections
                        WHERE cv.slug = :slug
                        """)
        Optional<OnlineCVJpaEntity> findBySlugWithSections(@Param("slug") String slug);
}