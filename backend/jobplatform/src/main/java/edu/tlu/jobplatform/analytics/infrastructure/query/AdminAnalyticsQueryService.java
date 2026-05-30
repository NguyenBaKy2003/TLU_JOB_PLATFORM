package edu.tlu.jobplatform.analytics.infrastructure.query;

import edu.tlu.jobplatform.analytics.domain.model.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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
 * Query service dành riêng cho Admin Analytics.
 *
 * Chỉ chứa các query platform-wide — không phụ thuộc companyId.
 * Cache Redis TTL: 5 phút (cấu hình trong AnalyticsCacheConfig).
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminAnalyticsQueryService {

    @PersistenceContext
    private final EntityManager em;

    // ── Dashboard ─────────────────────────────────────────────────────────────

    @Cacheable(value = "analytics:admin:dashboard", key = "'global'", unless = "#result == null")
    public AdminDashboardStats buildAdminDashboard() {
        log.debug("Building admin dashboard stats (cache miss)");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);

        // ── Users ─────────────────────────────────────────────────────────────
        long totalCandidates = countByRole("CANDIDATE");
        long totalEmployers = countByRole("EMPLOYER");
        long totalUsers = totalCandidates + totalEmployers;

        long newUsersThisMonth = countNewUsersSince(startOfMonth);
        long newUsersLastMonth = countNewUsersBetween(startOfLastMonth, startOfMonth);
        double userGrowthRate = growthRate(newUsersLastMonth, newUsersThisMonth);

        // ── Companies ─────────────────────────────────────────────────────────
        Object[] companyStats = (Object[]) em.createNativeQuery("""
                SELECT
                    COUNT(*)                                                  AS total,
                    COUNT(*) FILTER (WHERE verification_status = 'VERIFIED') AS verified,
                    COUNT(*) FILTER (WHERE verification_status = 'PENDING')  AS pending
                FROM company_profiles
                WHERE is_active = true
                """).getSingleResult();

        long totalCompanies = toLong(companyStats[0]);
        long verifiedCompanies = toLong(companyStats[1]);
        long pendingVerification = toLong(companyStats[2]);

        // ── Jobs ──────────────────────────────────────────────────────────────
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

        // ── Applications ──────────────────────────────────────────────────────
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

        // ── Revenue ───────────────────────────────────────────────────────────
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
        double revenueGrowthRate = growthRate(revenueLastMonth.doubleValue(), revenueThisMonth.doubleValue());

        // ── Livestream ────────────────────────────────────────────────────────
        Object[] streamStats = (Object[]) em.createNativeQuery("""
                SELECT
                    COUNT(*)                                              AS total,
                    COUNT(*) FILTER (WHERE created_at >= :startOfMonth)  AS this_month,
                    COALESCE(SUM(viewer_count), 0)                       AS total_viewers,
                    0                                                    AS applies_from_stream
                FROM live_stream_sessions
                WHERE is_active = true
                """)
                .setParameter("startOfMonth", startOfMonth)
                .getSingleResult();

        long totalStreamSessions = toLong(streamStats[0]);
        long streamSessionsThisMonth = toLong(streamStats[1]);
        long totalStreamViewers = toLong(streamStats[2]);
        long appliesFromStream = toLong(streamStats[3]);

        // ── Moderation queue ──────────────────────────────────────────────────
        Object[] moderationStats = (Object[]) em.createNativeQuery("""
                SELECT
                    (SELECT COUNT(*) FROM company_profiles
                     WHERE verification_status = 'PENDING' AND is_active = true)  AS pending_companies,
                    (SELECT COUNT(*) FROM job_posts
                     WHERE status = 'PENDING_APPROVAL' AND is_active = true)       AS pending_jobs,
                    (SELECT COUNT(*) FROM job_posts
                     WHERE status = 'FLAGGED' AND is_active = true)                AS flagged_jobs
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

    // ── Time series ───────────────────────────────────────────────────────────

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
                    cp.id,
                    cp.name,
                    cp.logo_url,
                    COUNT(DISTINCT jp.id)                                         AS total_jobs,
                    COUNT(DISTINCT a.id)                                          AS total_applications,
                    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'HIRED')        AS total_hired,
                    COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'SUCCESS'), 0) AS total_revenue,
                    COUNT(DISTINCT lss.id)                                        AS stream_sessions
                FROM company_profiles cp
                LEFT JOIN job_posts jp          ON jp.company_id  = cp.id AND jp.is_active  = true
                LEFT JOIN applications a         ON a.company_id   = cp.id AND a.is_active   = true
                LEFT JOIN company_subscriptions cs ON cs.company_id = cp.id
                LEFT JOIN payments p             ON p.subscription_id = cs.id
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

    // ── Private helpers ───────────────────────────────────────────────────────

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