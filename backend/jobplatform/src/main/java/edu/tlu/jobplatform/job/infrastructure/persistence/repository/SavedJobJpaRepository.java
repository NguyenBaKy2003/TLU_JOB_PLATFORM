package edu.tlu.jobplatform.job.infrastructure.persistence.repository;

import edu.tlu.jobplatform.job.infrastructure.persistence.entity.SavedJobJpaEntity;
import edu.tlu.jobplatform.job.infrastructure.persistence.projection.SavedJobCountProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedJobJpaRepository extends JpaRepository<SavedJobJpaEntity, UUID> {

    Optional<SavedJobJpaEntity> findByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId);

    boolean existsByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId);

    Page<SavedJobJpaEntity> findByCandidateId(UUID candidateId, Pageable pageable);

    void deleteByCandidateIdAndJobPostId(UUID candidateId, UUID jobPostId);

    /**
     * Tìm bài đăng đã lưu của ứng viên với lọc đa điều kiện.
     * - keyword: so khớp ILIKE với job title hoặc company name
     * - savedAtFrom / savedAtTo: lọc theo khoảng thời gian lưu
     * - jobType: lọc theo loại công việc (FULL_TIME, PART_TIME, ...)
     * - category: lọc theo danh mục
     */
    @Query("""
            SELECT s FROM SavedJobJpaEntity s
            JOIN JobPostJpaEntity jp ON jp.id = s.jobPostId
            WHERE s.candidateId = :candidateId
              AND (:keyword IS NULL OR :keyword = ''
                   OR LOWER(jp.title)    LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(jp.category) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:jobType   IS NULL OR :jobType   = '' OR jp.jobType  = :jobType)
              AND (:category  IS NULL OR :category  = '' OR jp.category = :category)
              AND (CAST(:savedAtFrom AS java.time.LocalDateTime) IS NULL OR s.savedAt >= :savedAtFrom)
              AND (CAST(:savedAtTo   AS java.time.LocalDateTime) IS NULL OR s.savedAt <= :savedAtTo)
            """)
    Page<SavedJobJpaEntity> searchByCandidateId(
            @Param("candidateId") UUID candidateId,
            @Param("keyword") String keyword,
            @Param("jobType") String jobType,
            @Param("category") String category,
            @Param("savedAtFrom") LocalDateTime savedAtFrom,
            @Param("savedAtTo") LocalDateTime savedAtTo,
            Pageable pageable);

    /**
     * Đếm số bài đã lưu theo category — dùng cho sidebar thống kê.
     */
    @Query("""
            SELECT jp.category AS category, COUNT(s) AS count
            FROM SavedJobJpaEntity s
            JOIN JobPostJpaEntity jp ON jp.id = s.jobPostId
            WHERE s.candidateId = :candidateId
            GROUP BY jp.category
            """)
    List<SavedJobCountProjection> countByCategoryForCandidate(@Param("candidateId") UUID candidateId);
}