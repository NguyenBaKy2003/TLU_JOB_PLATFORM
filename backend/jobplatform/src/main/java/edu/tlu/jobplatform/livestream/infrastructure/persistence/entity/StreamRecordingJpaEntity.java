package edu.tlu.jobplatform.livestream.infrastructure.persistence.entity;

import edu.tlu.jobplatform.livestream.domain.model.vo.AISummaryStatus;
import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

//  StreamRecording ──
@Entity
@Table(name = "stream_recordings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StreamRecordingJpaEntity extends BaseJpaEntity {

    @Column(name = "session_id", nullable = false, unique = true)
    private UUID sessionId;

    @Column(name = "recording_url")
    private String recordingUrl;

    @Column(name = "duration_seconds")
    private int durationSeconds;

    @Column(name = "transcript_text", columnDefinition = "TEXT")
    private String transcriptText;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "top_questions_json", columnDefinition = "jsonb")
    private String topQuestionsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "key_topics_json", columnDefinition = "jsonb")
    private String keyTopicsJson;

    @Enumerated(EnumType.STRING)
    @Column(name = "ai_summary_status", nullable = false, length = 20)
    private AISummaryStatus aiSummaryStatus;
}
