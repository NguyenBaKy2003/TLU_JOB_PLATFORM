package edu.tlu.jobplatform.company.infrastructure.persistence.repository;

import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
import edu.tlu.jobplatform.company.infrastructure.persistence.entity.CompanyJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface CompanyJpaRepository extends JpaRepository<CompanyJpaEntity, UUID> {

    boolean existsByOwnerId(UUID ownerId);

    boolean existsBySlug(String slug);

    boolean existsByNameIgnoreCase(String name);

    long countByVerificationStatus(VerificationStatus status);

    Optional<CompanyJpaEntity> findByOwnerId(UUID ownerId);

    Optional<CompanyJpaEntity> findBySlug(String slug);

    Page<CompanyJpaEntity> findByVerificationStatus(VerificationStatus status, Pageable pageable);

    Page<CompanyJpaEntity> findByVerificationStatusAndIsActiveTrue(VerificationStatus status, Pageable pageable);

    List<CompanyJpaEntity> findAllByOwnerIdIn(Collection<UUID> ownerIds);

    @Query("SELECT c FROM CompanyJpaEntity c WHERE LOWER(c.name) IN :names")
    List<CompanyJpaEntity> findByNamesIgnoreCase(@Param("names") List<String> names);

    @Query("""
            SELECT c FROM CompanyJpaEntity c
            WHERE c.verificationStatus = 'VERIFIED'
            AND EXISTS (
                SELECT 1 FROM JobPostJpaEntity j
                WHERE j.companyId = c.id AND j.status = 'PUBLISHED' AND j.isActive = true
            )
            """)
    Page<CompanyJpaEntity> findVerifiedCompaniesWithOpenJobs(Pageable pageable);

    // ── Stats projections ─────────────────────────────────────────────────────

    interface CompanyStatsProjection {
        UUID getCompanyId();

        int getActiveJobCount();

        double getAverageRating();

        int getReviewCount();
    }

    interface CompanyJobCountProjection {
        UUID getCompanyId();

        Long getCount();
    }

    @Query(value = """
            SELECT
                c.id                             AS companyId,
                COUNT(DISTINCT j.id)             AS activeJobCount,
                COALESCE(AVG(r.rating), 0)       AS averageRating,
                COUNT(DISTINCT r.id)             AS reviewCount
            FROM company_profiles c
            LEFT JOIN job_posts j
                ON j.company_id = c.id AND j.status = 'PUBLISHED' AND j.is_active = true
            LEFT JOIN company_reviews r
                ON r.company_id = c.id AND r.visible = true
            WHERE c.id = :companyId
            GROUP BY c.id
            """, nativeQuery = true)
    Optional<CompanyStatsProjection> findStatsByCompanyId(@Param("companyId") UUID companyId);

    @Query(value = """
            SELECT
                c.id                             AS companyId,
                COUNT(DISTINCT j.id)             AS activeJobCount,
                COALESCE(AVG(r.rating), 0)       AS averageRating,
                COUNT(DISTINCT r.id)             AS reviewCount
            FROM company_profiles c
            LEFT JOIN job_posts j
                ON j.company_id = c.id AND j.status = 'PUBLISHED' AND j.is_active = true
            LEFT JOIN company_reviews r
                ON r.company_id = c.id AND r.visible = true
            WHERE c.id IN :companyIds
            GROUP BY c.id
            """, nativeQuery = true)
    List<CompanyStatsProjection> findStatsByCompanyIds(@Param("companyIds") Set<UUID> companyIds);

    @Query(value = """
            SELECT j.company_id AS companyId, COUNT(j.id) AS count
            FROM job_posts j
            WHERE j.company_id IN :companyIds
              AND j.status = 'PUBLISHED'
              AND j.is_active = true
            GROUP BY j.company_id
            """, nativeQuery = true)
    List<CompanyJobCountProjection> countOpenJobsByCompanyIds(@Param("companyIds") Set<UUID> companyIds);

    // ── Plan-tier sort ────────────────────────────────────────────────────────

    @Query(value = """
            SELECT c.*
            FROM company_profiles c
            LEFT JOIN company_subscriptions s
                ON s.company_id = c.id
                AND s.status = 'ACTIVE'
                AND s.expires_at > NOW()
            WHERE c.verification_status = 'VERIFIED'
            ORDER BY
                CASE COALESCE(s.plan_code, 'FREE_COMPANY')
                    WHEN 'ENTERPRISE' THEN 1
                    WHEN 'BUSINESS'   THEN 2
                    WHEN 'STARTER'    THEN 3
                    ELSE                   4
                END ASC,
                c.created_at ASC
            """, countQuery = """
            SELECT COUNT(c.id)
            FROM company_profiles c
            WHERE c.verification_status = 'VERIFIED'
            """, nativeQuery = true)
    Page<CompanyJpaEntity> findVerifiedCompaniesSortedByPlan(Pageable pageable);

    @Query(value = """
            SELECT s.company_id, s.plan_code
            FROM company_subscriptions s
            WHERE s.company_id IN :companyIds
              AND s.status = 'ACTIVE'
              AND s.expires_at > NOW()
            """, nativeQuery = true)
    List<Object[]> findActivePlanCodesByCompanyIds(@Param("companyIds") Set<UUID> companyIds);

    // ── Multi-criteria search (keyword + city + size + minRating + planCode) ──

    /**
     * Tìm kiếm đa điều kiện công ty VERIFIED.
     *
     * Sort: plan tier (ENTERPRISE→BUSINESS→STARTER→FREE) → rating DESC → created_at
     * ASC.
     * Mọi filter đều optional — truyền NULL để bỏ qua điều kiện đó.
     *
     * @param keyword   tìm theo tên hoặc mô tả (ILIKE, null = bỏ qua)
     * @param city      lọc theo thành phố (null = bỏ qua)
     * @param size      lọc theo company size enum (null = bỏ qua)
     * @param minRating rating tối thiểu 1-5 (null = bỏ qua)
     * @param planCode  lọc theo plan cụ thể (null = bỏ qua)
     */
    @Query(value = """
            SELECT c.*
            FROM company_profiles c
            LEFT JOIN (
                SELECT DISTINCT ON (company_id) company_id, plan_code
                FROM company_subscriptions
                WHERE status = 'ACTIVE'
                  AND expires_at > NOW()
                ORDER BY company_id, expires_at DESC
            ) s ON s.company_id = c.id
            LEFT JOIN (
                SELECT company_id,
                       COALESCE(AVG(rating), 0) AS avg_rating
                FROM company_reviews
                WHERE visible = true
                GROUP BY company_id
            ) rating_agg ON rating_agg.company_id = c.id
            WHERE c.verification_status = 'VERIFIED'
              AND (
                    CAST(:keyword AS text) IS NULL
                    OR LOWER(c.name)        LIKE LOWER('%' || CAST(:keyword AS text) || '%')
                    OR LOWER(c.description) LIKE LOWER('%' || CAST(:keyword AS text) || '%')
                    OR LOWER(c.industry)    LIKE LOWER('%' || CAST(:keyword AS text) || '%')
              )
              AND (CAST(:city      AS text)    IS NULL OR LOWER(c.city) = LOWER(CAST(:city AS text)))
              AND (CAST(:size      AS text)    IS NULL OR c.size        = CAST(:size AS text))
              AND (CAST(:planCode  AS text)    IS NULL OR COALESCE(s.plan_code, 'FREE_COMPANY') = CAST(:planCode AS text))
              AND (CAST(:minRating AS numeric) IS NULL OR COALESCE(rating_agg.avg_rating, 0) >= CAST(:minRating AS numeric))
            ORDER BY
                CASE COALESCE(s.plan_code, 'FREE_COMPANY')
                    WHEN 'ENTERPRISE' THEN 1
                    WHEN 'BUSINESS'   THEN 2
                    WHEN 'STARTER'    THEN 3
                    ELSE                   4
                END ASC,
                COALESCE(rating_agg.avg_rating, 0) DESC,
                c.created_at ASC
            """, countQuery = """
            SELECT COUNT(c.id)
            FROM company_profiles c
            LEFT JOIN (
                SELECT DISTINCT ON (company_id) company_id, plan_code
                FROM company_subscriptions
                WHERE status = 'ACTIVE'
                  AND expires_at > NOW()
                ORDER BY company_id, expires_at DESC
            ) s ON s.company_id = c.id
            LEFT JOIN (
                SELECT company_id,
                       COALESCE(AVG(rating), 0) AS avg_rating
                FROM company_reviews
                WHERE visible = true
                GROUP BY company_id
            ) rating_agg ON rating_agg.company_id = c.id
            WHERE c.verification_status = 'VERIFIED'
              AND (
                    CAST(:keyword AS text) IS NULL
                    OR LOWER(c.name)        LIKE LOWER('%' || CAST(:keyword AS text) || '%')
                    OR LOWER(c.description) LIKE LOWER('%' || CAST(:keyword AS text) || '%')
                    OR LOWER(c.industry)    LIKE LOWER('%' || CAST(:keyword AS text) || '%')
              )
              AND (CAST(:city      AS text)    IS NULL OR LOWER(c.city) = LOWER(CAST(:city AS text)))
              AND (CAST(:size      AS text)    IS NULL OR c.size        = CAST(:size AS text))
              AND (CAST(:planCode  AS text)    IS NULL OR COALESCE(s.plan_code, 'FREE_COMPANY') = CAST(:planCode AS text))
              AND (CAST(:minRating AS numeric) IS NULL OR COALESCE(rating_agg.avg_rating, 0) >= CAST(:minRating AS numeric))
            """, nativeQuery = true)
    Page<CompanyJpaEntity> search(
            @Param("keyword") String keyword,
            @Param("city") String city,
            @Param("size") String size,
            @Param("planCode") String planCode,
            @Param("minRating") Double minRating,
            Pageable pageable);
}