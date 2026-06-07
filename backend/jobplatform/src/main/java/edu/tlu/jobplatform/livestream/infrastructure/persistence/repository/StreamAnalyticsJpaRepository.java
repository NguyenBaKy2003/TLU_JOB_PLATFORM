package edu.tlu.jobplatform.livestream.infrastructure.persistence.repository;

import edu.tlu.jobplatform.livestream.infrastructure.persistence.entity.StreamAnalyticsJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface StreamAnalyticsJpaRepository extends JpaRepository<StreamAnalyticsJpaEntity, UUID> {

    Optional<StreamAnalyticsJpaEntity> findBySessionId(UUID sessionId);

    boolean existsBySessionId(UUID sessionId);

    @Modifying
    @Query("""
            UPDATE StreamAnalyticsJpaEntity a
            SET a.totalViewerCount = a.totalViewerCount + 1
            WHERE a.sessionId = :sessionId
            """)
    void incrementTotalViewers(@Param("sessionId") UUID sessionId);

    @Modifying
    @Query(value = """
            INSERT INTO public.stream_analytics (
                id, session_id,
                peak_viewer_count, total_viewer_count, total_watch_seconds,
                apply_click_count, cv_view_count, poll_response_count, qa_question_count,
                heatmap_json, is_active,
                created_at, updated_at,
                created_by, updated_by
            ) VALUES (
                :id, :sessionId,
                :peakViewers, :totalViewers, :watchSeconds,
                0, 0, 0, 0,
                '[]', true,
                NOW(), NOW(),
                'system', 'system'
            )
            ON CONFLICT (session_id) DO UPDATE SET
                peak_viewer_count   = GREATEST(stream_analytics.peak_viewer_count, EXCLUDED.peak_viewer_count),
                total_viewer_count  = EXCLUDED.total_viewer_count,
                total_watch_seconds = stream_analytics.total_watch_seconds + EXCLUDED.total_watch_seconds,
                updated_at          = NOW()
            """, nativeQuery = true)
    void upsert(
            @Param("id") UUID id,
            @Param("sessionId") UUID sessionId,
            @Param("peakViewers") int peakViewers,
            @Param("totalViewers") int totalViewers,
            @Param("watchSeconds") long watchSeconds);
}