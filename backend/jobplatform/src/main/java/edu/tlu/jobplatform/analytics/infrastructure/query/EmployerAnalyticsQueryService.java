package edu.tlu.jobplatform.analytics.infrastructure.query;

import edu.tlu.jobplatform.analytics.domain.model.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Query service dành riêng cho Employer Analytics.
 *
 * Mọi query đều scoped theo companyId — không có query platform-wide.
 * Cache Redis TTL: 2 phút (cấu hình trong AnalyticsCacheConfig).
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployerAnalyticsQueryService {

    @PersistenceContext
    private final EntityManager em;

    // ── Dashboard ────────────

    @Cacheable(value = "analytics:employer:dashboard", key = "#companyId", unless = "#result == null")
    public EmployerDashboardStats buildEmployerDashboard(UUID companyId) {
        log.debug("Building employer dashboard for company={} (cache miss)", companyId);

        LocalDateTime startOfToday = LocalDateTime.now()
                .withHour(0).withMinute(0).withSecond(0).withNano(0);

        // ── Job stats ────────
        Object[] jobStats = (Object[]) em.createNativeQuery("""
                SELECT
                    COUNT(*) FILTER (WHERE status = 'PUBLISHED')                     AS active,
                    COUNT(*) FILTER (WHERE status = 'DRAFT')                         AS draft,
                    COUNT(*)                                                          AS total,
                    COUNT(*) FILTER (WHERE status = 'PUBLISHED'
                                      AND deadline <= CURRENT_DATE + INTERVAL '7 days'
                                      AND deadline >= CURRENT_DATE)                  AS expiring_soon
                FROM job_posts
                WHERE company_id = :companyId AND is_active = true
                """)
                .setParameter("companyId", companyId)
                .getSingleResult();

        // ── Application stats
        // Dùng subquery thay vì JOIN để tránh row duplication khi một job_post
        // có nhiều bản ghi liên quan. COUNT(a.id) đếm đúng từng đơn một lần.
        // pendingReview gồm tất cả đơn chưa kết thúc (chưa HIRED/REJECTED/WITHDRAWN).
        Object[] appStats = (Object[]) em.createNativeQuery("""
                SELECT
                    COUNT(a.id)                                                AS total,
                    COUNT(a.id) FILTER (WHERE a.applied_at >= :startOfToday)   AS new_today,
                    COUNT(a.id) FILTER (WHERE a.status IN (
                        'SUBMITTED', 'SCREENING', 'INTERVIEW', 'OFFERED'
                    ))                                                         AS pending_review
                FROM applications a
                WHERE a.job_post_id IN (
                    SELECT id FROM job_posts
                    WHERE company_id = :companyId AND is_active = true
                )
                AND a.is_active = true
                """)
                .setParameter("companyId", companyId)
                .setParameter("startOfToday", startOfToday)
                .getSingleResult();

        // ── Quota ────────────
        @SuppressWarnings("unchecked")
        List<Object[]> quotaRows = em.createNativeQuery("""
                SELECT
                    cs.job_post_quota_used,
                    cs.job_post_quota_limit,
                    cs.featured_job_quota_used,
                    cs.featured_job_quota_limit,
                    cs.cv_view_quota_used,
                    cs.cv_view_quota_limit
                FROM company_subscriptions cs
                WHERE cs.company_id = :companyId
                  AND cs.status = 'ACTIVE'
                  AND cs.is_active = true
                ORDER BY cs.created_at DESC
                LIMIT 1
                """)
                .setParameter("companyId", companyId)
                .getResultList();

        Object[] quotaStats = quotaRows.isEmpty()
                ? new Object[] { 0, 0, 0, 0, 0, 0 }
                : quotaRows.get(0);

        // ── Livestream stats ─
        Object[] streamStats = (Object[]) em.createNativeQuery("""
                SELECT
                    COUNT(DISTINCT lss.id)                AS total_sessions,
                    COALESCE(SUM(lss.viewer_count), 0)    AS total_viewers,
                    0                                     AS applies_from_stream
                FROM live_stream_sessions lss
                WHERE lss.company_id = :companyId AND lss.is_active = true
                """)
                .setParameter("companyId", companyId)
                .getSingleResult();

        return EmployerDashboardStats.builder()
                .companyId(companyId)
                .activeJobs(toLong(jobStats[0]))
                .draftJobs(toLong(jobStats[1]))
                .totalJobsAllTime(toLong(jobStats[2]))
                .jobsExpiringSoon(toLong(jobStats[3]))
                .totalApplications(toLong(appStats[0]))
                .newApplicationsToday(toLong(appStats[1]))
                .pendingReview(toLong(appStats[2]))
                .quotaUsed(toInt(quotaStats[0]))
                .quotaTotal(toInt(quotaStats[1]))
                .streamQuotaUsed(0)
                .streamQuotaTotal(0)
                .totalStreamSessions(toLong(streamStats[0]))
                .totalStreamViewers(toLong(streamStats[1]))
                .appliesFromStream(toLong(streamStats[2]))
                .build();
    }

    // ── Job performance ──────

    public List<JobPerformanceStats> getJobPerformance(UUID companyId) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery("""
                SELECT
                    jp.id,
                    jp.title,
                    jp.status,
                    jp.view_count,
                    COUNT(a.id)                                                     AS total,
                    COUNT(a.id) FILTER (WHERE a.status = 'SCREENING')               AS screening,
                    COUNT(a.id) FILTER (WHERE a.status IN ('INTERVIEW', 'OFFERED')) AS interviewing,
                    COUNT(a.id) FILTER (WHERE a.status = 'OFFERED')                 AS offered,
                    COUNT(a.id) FILTER (WHERE a.status = 'HIRED')                   AS hired,
                    TO_CHAR(jp.deadline, 'YYYY-MM-DD')                             AS deadline
                FROM job_posts jp
                LEFT JOIN applications a ON a.job_post_id = jp.id AND a.is_active = true
                WHERE jp.company_id = :companyId AND jp.is_active = true
                GROUP BY jp.id, jp.title, jp.status, jp.view_count, jp.deadline
                ORDER BY jp.created_at DESC
                """)
                .setParameter("companyId", companyId)
                .getResultList();

        return rows.stream().map(r -> {
            long total = toLong(r[4]);
            long hired = toLong(r[8]);
            double rate = total > 0 ? (double) hired / total * 100 : 0.0;
            return JobPerformanceStats.builder()
                    .jobPostId(toUUID(r[0]))
                    .title((String) r[1])
                    .status((String) r[2])
                    .viewCount(toInt(r[3]))
                    .totalApplications(total)
                    .screening(toLong(r[5]))
                    .interviewing(toLong(r[6]))
                    .offered(toLong(r[7]))
                    .hired(hired)
                    .conversionRate(rate)
                    .deadline((String) r[9])
                    .build();
        }).toList();
    }

    // ── Application funnel ───

    public ApplicationFunnelStats getApplicationFunnel(UUID companyId, UUID jobPostId) {
        String jobCondition = jobPostId != null ? "AND a.job_post_id = :jobPostId" : "";

        Query q = em.createNativeQuery("""
                SELECT
                    COUNT(a.id) FILTER (WHERE a.status = 'SUBMITTED')                           AS submitted,
                    COUNT(a.id) FILTER (WHERE a.status IN ('REVIEWING', 'SHORTLISTED'))         AS reviewing,
                    COUNT(a.id) FILTER (WHERE a.status IN ('INTERVIEW_SCHEDULED', 'INTERVIEWED')) AS interviewing,
                    COUNT(a.id) FILTER (WHERE a.status IN ('OFFERED', 'ACCEPTED'))               AS offered,
                    COUNT(a.id) FILTER (WHERE a.status = 'HIRED')                                AS hired,
                    COUNT(a.id) FILTER (WHERE a.status = 'REJECTED')                             AS rejected,
                    COUNT(a.id) FILTER (WHERE a.status = 'WITHDRAWN')                            AS withdrawn,
                    COUNT(a.id) FILTER (WHERE a.status = 'DECLINED')                             AS declined,
                    COUNT(a.id) FILTER (WHERE a.status = 'CANCELLED')                            AS cancelled
                FROM applications a
                WHERE a.job_post_id IN (
                    SELECT id FROM job_posts
                    WHERE company_id = :companyId AND is_active = true
                )
                AND a.is_active = true
                """ + jobCondition)
                .setParameter("companyId", companyId);

        if (jobPostId != null) {
            q.setParameter("jobPostId", jobPostId);
        }

        Object[] r = (Object[]) q.getSingleResult();

        return ApplicationFunnelStats.builder()
                .companyId(companyId)
                .jobPostId(jobPostId)
                .submitted(toLong(r[0]))
                .reviewing(toLong(r[1]))
                .interviewing(toLong(r[2]))
                .offered(toLong(r[3]))
                .hired(toLong(r[4]))
                .rejected(toLong(r[5]))
                .withdrawn(toLong(r[6]))
                .declined(toLong(r[7]))
                .cancelled(toLong(r[8]))
                .build();
    }

    // ── Private helpers ──────

    private static long toLong(Object o) {
        if (o == null)
            return 0L;
        return ((Number) o).longValue();
    }

    private static int toInt(Object o) {
        if (o == null)
            return 0;
        return ((Number) o).intValue();
    }

    private static UUID toUUID(Object o) {
        if (o == null)
            return null;
        if (o instanceof UUID u)
            return u;
        return UUID.fromString(o.toString());
    }

    // ── Application & view trend ──────────────────────────────────────────────

    /**
     * Trả về số đơn ứng tuyển và tổng lượt xem theo từng tháng.
     *
     * view_count là cột tích lũy trên job_posts — không có bảng job_post_views
     * riêng. Phân bổ theo tháng tạo job post (created_at) là xấp xỉ tốt nhất
     * có thể mà không cần migration schema.
     */
    public List<ApplicationTrendData> getApplicationTrend(UUID companyId, int months) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery("""
                SELECT
                    TO_CHAR(DATE_TRUNC('month', month_series), 'YYYY-MM') AS label,
                    COALESCE(app.total_applications, 0)                   AS applications,
                    COALESCE(view.total_views, 0)                         AS views
                FROM GENERATE_SERIES(
                    DATE_TRUNC('month', NOW() - MAKE_INTERVAL(months => :months) + INTERVAL '1 month'),
                    DATE_TRUNC('month', NOW()),
                    INTERVAL '1 month'
                ) AS month_series
                LEFT JOIN (
                    SELECT
                        DATE_TRUNC('month', a.applied_at) AS month,
                        COUNT(a.id)                        AS total_applications
                    FROM applications a
                    WHERE a.job_post_id IN (
                        SELECT id FROM job_posts
                        WHERE company_id = :companyId AND is_active = true
                    )
                    AND a.is_active = true
                    GROUP BY 1
                ) app ON app.month = DATE_TRUNC('month', month_series)
                LEFT JOIN (
                    SELECT
                        DATE_TRUNC('month', jp.created_at) AS month,
                        SUM(jp.view_count)                  AS total_views
                    FROM job_posts jp
                    WHERE jp.company_id = :companyId
                      AND jp.is_active = true
                    GROUP BY 1
                ) view ON view.month = DATE_TRUNC('month', month_series)
                ORDER BY month_series
                """)
                .setParameter("companyId", companyId)
                .setParameter("months", months)
                .getResultList();

        return rows.stream()
                .map(r -> ApplicationTrendData.builder()
                        .label((String) r[0])
                        .applications(toLong(r[1]))
                        .views(toLong(r[2]))
                        .build())
                .toList();
    }
}