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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service đọc dữ liệu analytics bằng native SQL.
 *
 * Không import entity/repository của domain khác.
 * Chỉ dùng EntityManager để query trực tiếp — đây là điểm duy nhất
 * được phép cross-domain ở tầng infrastructure.
 *
 * Cache Redis TTL: 5 phút cho admin stats, 2 phút cho employer stats.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsQueryService {

    @PersistenceContext
    private final EntityManager em;

    // ADMIN DASHBOARD

    @Cacheable(value = "analytics:admin:dashboard", key = "'global'", unless = "#result == null")
    public AdminDashboardStats buildAdminDashboard() {
        log.debug("Building admin dashboard stats (cache miss)");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);

        // ── Users ─
        long totalCandidates = countByRole("CANDIDATE");
        long totalEmployers = countByRole("EMPLOYER");
        long totalUsers = totalCandidates + totalEmployers;

        long newUsersThisMonth = countNewUsersSince(startOfMonth);
        long newUsersLastMonth = countNewUsersBetween(startOfLastMonth, startOfMonth);
        double userGrowthRate = growthRate(newUsersLastMonth, newUsersThisMonth);

        // ── Companies
        Object[] companyStats = (Object[]) em.createNativeQuery("""
                SELECT
                    COUNT(*)                                                 AS total,
                    COUNT(*) FILTER (WHERE verification_status = 'VERIFIED') AS verified,
                    COUNT(*) FILTER (WHERE verification_status = 'PENDING')  AS pending
                FROM company_profiles
                WHERE is_active = true
                """).getSingleResult();

        long totalCompanies = toLong(companyStats[0]);
        long verifiedCompanies = toLong(companyStats[1]);
        long pendingVerification = toLong(companyStats[2]);

        // ── Jobs ──
        Object[] jobStats = (Object[]) em.createNativeQuery("""
                SELECT
                    COUNT(*)                                              AS total,
                    COUNT(*) FILTER (WHERE status = 'PUBLISHED')         AS active,
                    COUNT(*) FILTER (WHERE created_at >= :startOfMonth)  AS this_month,
                    COUNT(*) FILTER (WHERE created_at >= :lastMonth
                                      AND created_at < :startOfMonth)    AS last_month
                FROM job_posts
                WHERE is_active = true
                """)
                .setParameter("startOfMonth", startOfMonth)
                .setParameter("lastMonth", startOfLastMonth)
                .getSingleResult();

        long totalJobs = toLong(jobStats[0]);
        long activeJobs = toLong(jobStats[1]);
        long jobsThisMonth = toLong(jobStats[2]);
        long jobsLastMonth = toLong(jobStats[3]);
        double jobGrowthRate = growthRate(jobsLastMonth, jobsThisMonth);

        // ── Applications ──
        Object[] appStats = (Object[]) em.createNativeQuery("""
                SELECT
                    COUNT(*)                                              AS total,
                    COUNT(*) FILTER (WHERE applied_at >= :startOfMonth)  AS this_month,
                    COUNT(*) FILTER (WHERE applied_at >= :lastMonth
                                      AND applied_at < :startOfMonth)    AS last_month
                FROM applications
                WHERE is_active = true
                """)
                .setParameter("startOfMonth", startOfMonth)
                .setParameter("lastMonth", startOfLastMonth)
                .getSingleResult();

        long totalApplications = toLong(appStats[0]);
        long applicationsThisMonth = toLong(appStats[1]);
        long applicationsLastMonth = toLong(appStats[2]);
        double applicationGrowthRate = growthRate(applicationsLastMonth, applicationsThisMonth);

        // ── Revenue ──
        Object[] revenueStats = (Object[]) em.createNativeQuery("""
                SELECT
                    COALESCE(SUM(amount) FILTER (WHERE completed_at >= :startOfMonth), 0)  AS this_month,
                    COALESCE(SUM(amount) FILTER (WHERE completed_at >= :lastMonth
                                                   AND completed_at < :startOfMonth), 0)   AS last_month
                FROM payments
                WHERE status = 'SUCCESS'
                """)
                .setParameter("startOfMonth", startOfMonth)
                .setParameter("lastMonth", startOfLastMonth)
                .getSingleResult();

        BigDecimal revenueThisMonth = toBigDecimal(revenueStats[0]);
        BigDecimal revenueLastMonth = toBigDecimal(revenueStats[1]);
        double revenueGrowthRate = growthRate(
                revenueLastMonth.doubleValue(), revenueThisMonth.doubleValue());

        // ── Livestream ─
        Object[] streamStats = (Object[]) em.createNativeQuery("""
                SELECT
                    COUNT(*)                                                AS total,
                    COUNT(*) FILTER (WHERE created_at >= :startOfMonth)    AS this_month,
                    COALESCE(SUM(viewer_count), 0)                         AS total_viewers,
                    0                                                       AS applies_from_stream
                FROM live_stream_sessions lss
                WHERE lss.is_active = true
                """)
                .setParameter("startOfMonth", startOfMonth)
                .getSingleResult();

        long totalStreamSessions = toLong(streamStats[0]);
        long streamSessionsThisMonth = toLong(streamStats[1]);
        long totalStreamViewers = toLong(streamStats[2]);
        long appliesFromStream = toLong(streamStats[3]);

        // ── Moderation queue ─
        Object[] moderationStats = (Object[]) em.createNativeQuery("""
                SELECT
                    (SELECT COUNT(*) FROM company_profiles
                     WHERE verification_status = 'PENDING' AND is_active = true)   AS pending_companies,
                    (SELECT COUNT(*) FROM job_posts
                     WHERE status = 'PENDING_APPROVAL' AND is_active = true)        AS pending_jobs,
                    (SELECT COUNT(*) FROM job_posts
                     WHERE status = 'FLAGGED' AND is_active = true)                 AS flagged_jobs
                """).getSingleResult();

        return AdminDashboardStats.builder()
                .totalUsers(totalUsers)
                .totalCandidates(totalCandidates)
                .totalEmployers(totalEmployers)
                .newUsersThisMonth(newUsersThisMonth)
                .userGrowthRate(userGrowthRate)
                .totalCompanies(totalCompanies)
                .verifiedCompanies(verifiedCompanies)
                .pendingVerification(pendingVerification)
                .totalJobs(totalJobs)
                .activeJobs(activeJobs)
                .jobsThisMonth(jobsThisMonth)
                .jobGrowthRate(jobGrowthRate)
                .totalApplications(totalApplications)
                .applicationsThisMonth(applicationsThisMonth)
                .applicationGrowthRate(applicationGrowthRate)
                .revenueThisMonth(revenueThisMonth)
                .revenueLastMonth(revenueLastMonth)
                .revenueGrowthRate(revenueGrowthRate)
                .totalStreamSessions(totalStreamSessions)
                .streamSessionsThisMonth(streamSessionsThisMonth)
                .totalStreamViewers(totalStreamViewers)
                .appliesFromStream(appliesFromStream)
                .pendingCompanyVerifications(toLong(moderationStats[0]))
                .pendingJobApprovals(toLong(moderationStats[1]))
                .flaggedJobs(toLong(moderationStats[2]))
                .generatedAt(now)
                .build();
    }

    @Cacheable(value = "analytics:admin:user-growth", key = "#months", unless = "#result == null")
    public List<TimeSeriesData> getUserGrowthTimeSeries(int months) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery("""
                SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
                       COUNT(*)                                             AS total
                FROM users
                WHERE is_active = true
                  AND created_at >= NOW() - MAKE_INTERVAL(months => :months)
                GROUP BY 1
                ORDER BY 1
                """)
                .setParameter("months", months)
                .getResultList();

        return TimeSeriesData.ofMonthly(rows);
    }

    @Cacheable(value = "analytics:admin:revenue", key = "#months", unless = "#result == null")
    public List<TimeSeriesData> getRevenueTimeSeries(int months) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery("""
                SELECT TO_CHAR(DATE_TRUNC('month', completed_at), 'YYYY-MM') AS month,
                       COALESCE(SUM(amount), 0)                               AS total
                FROM payments
                WHERE status = 'SUCCESS'
                  AND completed_at >= NOW() - MAKE_INTERVAL(months => :months)
                GROUP BY 1
                ORDER BY 1
                """)
                .setParameter("months", months)
                .getResultList();

        return TimeSeriesData.ofMonthly(rows);
    }

    @Cacheable(value = "analytics:admin:top-companies", key = "#limit", unless = "#result == null")
    public List<TopCompanyStats> getTopCompanies(int limit) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery("""
                SELECT
                    cp.id                                                        AS company_id,
                    cp.name                                                      AS company_name,
                    cp.logo_url,
                    COUNT(DISTINCT jp.id)                                        AS total_jobs,
                    COUNT(DISTINCT a.id)                                         AS total_applications,
                    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'HIRED')       AS total_hired,
                    COALESCE(SUM(p.amount) FILTER (WHERE p.status='SUCCESS'), 0) AS total_revenue,
                    COUNT(DISTINCT lss.id)                                       AS stream_sessions
                FROM company_profiles cp
                LEFT JOIN job_posts jp      ON jp.company_id = cp.id AND jp.is_active = true
                LEFT JOIN applications a    ON a.company_id  = cp.id AND a.is_active  = true
                LEFT JOIN company_subscriptions cs ON cs.company_id = cp.id
                LEFT JOIN payments p        ON p.subscription_id = cs.id
                LEFT JOIN live_stream_sessions lss ON lss.company_id = cp.id AND lss.is_active = true
                WHERE cp.is_active = true AND cp.verification_status = 'VERIFIED'
                GROUP BY cp.id, cp.name, cp.logo_url
                ORDER BY total_revenue DESC, total_applications DESC
                LIMIT :limit
                """)
                .setParameter("limit", limit)
                .getResultList();

        List<TopCompanyStats> result = new ArrayList<>();
        for (int i = 0; i < rows.size(); i++) {
            Object[] r = rows.get(i);
            result.add(TopCompanyStats.builder()
                    .companyId(toUUID(r[0]))
                    .companyName((String) r[1])
                    .logoUrl((String) r[2])
                    .totalJobs(toLong(r[3]))
                    .totalApplications(toLong(r[4]))
                    .totalHired(toLong(r[5]))
                    .totalRevenue(toBigDecimal(r[6]))
                    .streamSessions(toLong(r[7]))
                    .rank(i + 1)
                    .build());
        }
        return result;
    }

    @Cacheable(value = "analytics:admin:livestream", key = "'platform'", unless = "#result == null")
    public List<TimeSeriesData> getStreamSessionsTimeSeries(int months) {
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery("""
                SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
                       COUNT(*)                                              AS total
                FROM live_stream_sessions
                WHERE is_active = true
                  AND created_at >= NOW() - MAKE_INTERVAL(months => :months)
                GROUP BY 1
                ORDER BY 1
                """)
                .setParameter("months", months)
                .getResultList();

        return TimeSeriesData.ofMonthly(rows);
    }

    // EMPLOYER DASHBOARD

    @Cacheable(value = "analytics:employer:dashboard", key = "#companyId", unless = "#result == null")
    public EmployerDashboardStats buildEmployerDashboard(UUID companyId) {
        log.debug("Building employer dashboard for company={} (cache miss)", companyId);

        LocalDateTime startOfToday = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);

        // ── Job stats
        Object[] jobStats = (Object[]) em.createNativeQuery("""
                SELECT
                    COUNT(*) FILTER (WHERE status = 'PUBLISHED')                      AS active,
                    COUNT(*) FILTER (WHERE status = 'DRAFT')                          AS draft,
                    COUNT(*)                                                           AS total,
                    COUNT(*) FILTER (WHERE status = 'PUBLISHED'
                                      AND deadline <= CURRENT_DATE + INTERVAL '7 days'
                                      AND deadline >= CURRENT_DATE)                   AS expiring_soon
                FROM job_posts
                WHERE company_id = :companyId AND is_active = true
                """)
                .setParameter("companyId", companyId)
                .getSingleResult();

        // ── Application stats
        Object[] appStats = (Object[]) em.createNativeQuery("""
                SELECT
                    COUNT(*)                                                           AS total,
                    COUNT(*) FILTER (WHERE a.applied_at >= :startOfToday)             AS new_today,
                    COUNT(*) FILTER (WHERE a.status = 'SUBMITTED')                    AS pending_review
                FROM applications a
                JOIN job_posts jp ON jp.id = a.job_post_id
                WHERE jp.company_id = :companyId AND a.is_active = true
                """)
                .setParameter("companyId", companyId)
                .setParameter("startOfToday", startOfToday)
                .getSingleResult();

        // ── Quota ─
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

        Object[] quotaStats = quotaRows.isEmpty() ? new Object[] { 0, 0, 0, 0, 0, 0 } : quotaRows.get(0);

        // ── Livestream stats ─
        Object[] streamStats = (Object[]) em.createNativeQuery("""
                SELECT
                    COUNT(DISTINCT lss.id)                        AS total_sessions,
                    COALESCE(SUM(lss.viewer_count), 0)            AS total_viewers,
                    0                                             AS applies_from_stream
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
                .quotaUsed(toInt(quotaStats[0])) // job_post_quota_used
                .quotaTotal(toInt(quotaStats[1])) // job_post_quota_limit
                // quotaStats[2..5] = featured/cv quota — wire up if EmployerDashboardStats has
                // those fields
                .streamQuotaUsed(0)
                .streamQuotaTotal(0)
                .totalStreamSessions(toLong(streamStats[0]))
                .totalStreamViewers(toLong(streamStats[1]))
                .appliesFromStream(toLong(streamStats[2]))
                .build();
    }

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
                    COUNT(a.id) FILTER (WHERE a.status IN ('INTERVIEW','OFFERED'))  AS interviewing,
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

    public ApplicationFunnelStats getApplicationFunnel(UUID companyId, UUID jobPostId) {
        String condition = jobPostId != null
                ? "AND a.job_post_id = :jobPostId"
                : "";

        Query q = em.createNativeQuery("""
                SELECT
                    COUNT(*) FILTER (WHERE a.status = 'SUBMITTED')   AS submitted,
                    COUNT(*) FILTER (WHERE a.status = 'SCREENING')   AS screening,
                    COUNT(*) FILTER (WHERE a.status = 'INTERVIEW')   AS interviewing,
                    COUNT(*) FILTER (WHERE a.status = 'OFFERED')     AS offered,
                    COUNT(*) FILTER (WHERE a.status = 'HIRED')       AS hired,
                    COUNT(*) FILTER (WHERE a.status = 'REJECTED')    AS rejected,
                    COUNT(*) FILTER (WHERE a.status = 'WITHDRAWN')   AS withdrawn
                FROM applications a
                JOIN job_posts jp ON jp.id = a.job_post_id
                WHERE jp.company_id = :companyId AND a.is_active = true
                """ + condition)
                .setParameter("companyId", companyId);

        if (jobPostId != null) {
            q.setParameter("jobPostId", jobPostId);
        }

        Object[] r = (Object[]) q.getSingleResult();

        return ApplicationFunnelStats.builder()
                .companyId(companyId)
                .jobPostId(jobPostId)
                .submitted(toLong(r[0]))
                .screening(toLong(r[1]))
                .interviewing(toLong(r[2]))
                .offered(toLong(r[3]))
                .hired(toLong(r[4]))
                .rejected(toLong(r[5]))
                .withdrawn(toLong(r[6]))
                .build();
    }

    //
    // PRIVATE HELPERS
    //

    private long countByRole(String role) {
        return ((Number) em.createNativeQuery(
                "SELECT COUNT(*) FROM users WHERE role = :role AND is_active = true")
                .setParameter("role", role)
                .getSingleResult()).longValue();
    }

    private long countNewUsersSince(LocalDateTime since) {
        return ((Number) em.createNativeQuery(
                "SELECT COUNT(*) FROM users WHERE created_at >= :since AND is_active = true")
                .setParameter("since", since)
                .getSingleResult()).longValue();
    }

    private long countNewUsersBetween(LocalDateTime from, LocalDateTime to) {
        return ((Number) em.createNativeQuery(
                "SELECT COUNT(*) FROM users WHERE created_at >= :from AND created_at < :to AND is_active = true")
                .setParameter("from", from)
                .setParameter("to", to)
                .getSingleResult()).longValue();
    }

    private double growthRate(long previous, long current) {
        if (previous == 0)
            return current > 0 ? 100.0 : 0.0;
        return (double) (current - previous) / previous * 100;
    }

    private double growthRate(double previous, double current) {
        if (previous == 0)
            return current > 0 ? 100.0 : 0.0;
        return (current - previous) / previous * 100;
    }

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

    private static BigDecimal toBigDecimal(Object o) {
        if (o == null)
            return BigDecimal.ZERO;
        if (o instanceof BigDecimal bd)
            return bd;
        return new BigDecimal(o.toString());
    }

    private static UUID toUUID(Object o) {
        if (o == null)
            return null;
        if (o instanceof UUID u)
            return u;
        return UUID.fromString(o.toString());
    }
}