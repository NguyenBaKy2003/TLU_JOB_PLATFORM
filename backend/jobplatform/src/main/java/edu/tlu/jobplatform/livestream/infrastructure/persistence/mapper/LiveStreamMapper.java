package edu.tlu.jobplatform.livestream.infrastructure.persistence.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.livestream.domain.model.*;
import edu.tlu.jobplatform.livestream.domain.model.vo.*;
import edu.tlu.jobplatform.livestream.infrastructure.persistence.entity.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class LiveStreamMapper {

    private final ObjectMapper objectMapper;

    // ─── LiveStreamSession ───────────────────────────────────────────────────

    /**
     * Domain → JPA entity.
     * Truyền id từ domain để tránh @PrePersist sinh UUID mới.
     */
    public LiveStreamSessionJpaEntity toJpa(LiveStreamSession domain) {
        LiveStreamSessionJpaEntity entity = LiveStreamSessionJpaEntity.builder()
                .companyId(domain.getCompanyId())
                .hostUserId(domain.getHostUserId())
                .title(domain.getTitle())
                .description(domain.getDescription())
                .thumbnailUrl(domain.getThumbnailUrl())
                .sessionType(domain.getSessionType())
                .status(domain.getStatus())
                .scheduledAt(domain.getScheduledAt())
                .startedAt(domain.getStartedAt())
                .endedAt(domain.getEndedAt())
                .maxViewers(domain.getMaxViewers())
                .viewerCount(domain.getViewerCount())
                .quotaConsumed(domain.isQuotaConsumed())
                .interviewSlotsJson(toJson(domain.getInterviewSlots()))
                .build();

        entity.setId(domain.getId());
        return entity;
    }

    /**
     * JPA entity → Domain.
     * Dùng LiveStreamSession.restore() để giữ đúng UUID từ DB,
     * không gọi create() vì create() luôn sinh UUID mới.
     */
    public LiveStreamSession toDomain(LiveStreamSessionJpaEntity jpa) {
        return LiveStreamSession.restore(
                jpa.getId(), // ← ID từ DB
                jpa.getCompanyId(),
                jpa.getHostUserId(),
                jpa.getTitle(),
                jpa.getDescription(),
                jpa.getThumbnailUrl(),
                jpa.getSessionType(),
                jpa.getStatus(),
                jpa.getScheduledAt(),
                jpa.getStartedAt(),
                jpa.getEndedAt(),
                jpa.getMaxViewers(),
                jpa.getViewerCount(),
                jpa.isQuotaConsumed(),
                parseInterviewSlots(jpa.getInterviewSlotsJson()));
    }

    // ─── StreamEvent ─────────────────────────────────────────────────────────

    public StreamEventJpaEntity toJpa(StreamEvent domain) {
        return StreamEventJpaEntity.builder()
                .sessionId(domain.getSessionId())
                .senderId(domain.getSenderId())
                .type(domain.getType())
                .payload(domain.getPayload())
                .occurredAt(domain.getOccurredAt())
                .build();
    }

    public StreamEvent toDomain(StreamEventJpaEntity jpa) {
        return StreamEvent.of(
                jpa.getSessionId(),
                jpa.getSenderId(),
                jpa.getType(),
                jpa.getPayload());
    }

    // ─── StreamRecording ─────────────────────────────────────────────────────

    public StreamRecordingJpaEntity toJpa(StreamRecording domain) {
        return StreamRecordingJpaEntity.builder()
                .sessionId(domain.getSessionId())
                .recordingUrl(domain.getRecordingUrl())
                .durationSeconds(domain.getDurationSeconds())
                .transcriptText(domain.getTranscriptText())
                .aiSummary(domain.getAiSummary())
                .topQuestionsJson(toJson(domain.getTopQuestions()))
                .keyTopicsJson(toJson(domain.getKeyTopics()))
                .aiSummaryStatus(domain.getAiSummaryStatus())
                .build();
    }

    public StreamRecording toDomain(StreamRecordingJpaEntity jpa) {
        StreamRecording recording = StreamRecording.create(
                jpa.getSessionId(),
                jpa.getRecordingUrl(),
                jpa.getDurationSeconds());
        recording.setTranscriptText(jpa.getTranscriptText());
        recording.setAiSummary(jpa.getAiSummary());
        recording.setTopQuestions(parseStringList(jpa.getTopQuestionsJson()));
        recording.setKeyTopics(parseStringList(jpa.getKeyTopicsJson()));
        recording.setAiSummaryStatus(jpa.getAiSummaryStatus());
        return recording;
    }

    // ─── StreamAnalytics ─────────────────────────────────────────────────────

    public StreamAnalyticsJpaEntity toJpa(StreamAnalytics domain) {
        return StreamAnalyticsJpaEntity.builder()
                .sessionId(domain.getSessionId())
                .peakViewerCount(domain.getPeakViewerCount())
                .totalViewerCount(domain.getTotalViewerCount())
                .totalWatchSeconds(domain.getTotalWatchSeconds())
                .applyClickCount(domain.getApplyClickCount())
                .cvViewCount(domain.getCvViewCount())
                .pollResponseCount(domain.getPollResponseCount())
                .qaQuestionCount(domain.getQaQuestionCount())
                .heatmapJson(toJson(domain.getDropOffHeatmap()))
                .build();
    }

    public StreamAnalytics toDomain(StreamAnalyticsJpaEntity jpa) {
        StreamAnalytics analytics = StreamAnalytics.createFor(jpa.getSessionId());
        analytics.setPeakViewerCount(jpa.getPeakViewerCount());
        analytics.setTotalWatchSeconds(jpa.getTotalWatchSeconds());
        analytics.restoreTotalViewerCount(jpa.getTotalViewerCount());
        analytics.setApplyClickCount(jpa.getApplyClickCount());
        analytics.setCvViewCount(jpa.getCvViewCount());
        analytics.setPollResponseCount(jpa.getPollResponseCount());
        analytics.setQaQuestionCount(jpa.getQaQuestionCount());
        analytics.setDropOffHeatmap(parseHeatmap(jpa.getHeatmapJson()));
        return analytics;
    }

    // ─── JSON helpers ─────────────────────────────────────────────────────────

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.warn("Không thể serialize object sang JSON: {}", e.getMessage());
            return "[]";
        }
    }

    private List<InterviewSlot> parseInterviewSlots(String json) {
        if (json == null || json.isBlank())
            return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
            log.warn("Không thể parse interview slots JSON: {}", e.getMessage());
            return List.of();
        }
    }

    private List<String> parseStringList(String json) {
        if (json == null || json.isBlank())
            return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
            log.warn("Không thể parse string list JSON: {}", e.getMessage());
            return List.of();
        }
    }

    private List<HeatmapPoint> parseHeatmap(String json) {
        if (json == null || json.isBlank())
            return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
            log.warn("Không thể parse heatmap JSON: {}", e.getMessage());
            return List.of();
        }
    }
}