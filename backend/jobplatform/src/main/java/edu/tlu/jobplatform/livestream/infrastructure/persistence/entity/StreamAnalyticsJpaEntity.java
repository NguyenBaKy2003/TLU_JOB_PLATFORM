package edu.tlu.jobplatform.livestream.infrastructure.persistence.entity;

import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

// ─── StreamAnalytics ─────────────────────────────────────────
@Entity
@Table(name = "stream_analytics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StreamAnalyticsJpaEntity extends BaseJpaEntity {

    @Column(name = "session_id", nullable = false, unique = true)
    private UUID sessionId;

    @Column(name = "peak_viewer_count")
    private int peakViewerCount;

    @Column(name = "total_viewer_count")
    private int totalViewerCount;

    @Column(name = "total_watch_seconds")
    private long totalWatchSeconds;

    @Column(name = "apply_click_count")
    private int applyClickCount;

    @Column(name = "cv_view_count")
    private int cvViewCount;

    @Column(name = "poll_response_count")
    private int pollResponseCount;

    @Column(name = "qa_question_count")
    private int qaQuestionCount;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "heatmap_json", columnDefinition = "jsonb")
    private String heatmapJson;
}