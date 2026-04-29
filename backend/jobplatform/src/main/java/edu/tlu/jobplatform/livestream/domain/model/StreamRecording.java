package edu.tlu.jobplatform.livestream.domain.model;

import edu.tlu.jobplatform.livestream.domain.model.vo.AISummaryStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
public class StreamRecording {

    private final UUID id;
    private final UUID sessionId;

    @Setter
    private String recordingUrl;
    @Setter
    private int durationSeconds;
    @Setter
    private String transcriptText;
    @Setter
    private String aiSummary;
    @Setter
    private AISummaryStatus aiSummaryStatus;

    private List<String> topQuestions;
    private List<String> keyTopics;

    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static StreamRecording create(UUID sessionId, String recordingUrl, int durationSeconds) {
        StreamRecording r = new StreamRecording(UUID.randomUUID(), sessionId);
        r.recordingUrl = recordingUrl;
        r.durationSeconds = durationSeconds;
        r.aiSummaryStatus = AISummaryStatus.PENDING;
        return r;
    }

    private StreamRecording(UUID id, UUID sessionId) {
        this.id = id;
        this.sessionId = sessionId;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void startProcessing() {
        this.aiSummaryStatus = AISummaryStatus.PROCESSING;
        this.updatedAt = LocalDateTime.now();
    }

    public void completeSummary(String transcriptText, String aiSummary,
            List<String> topQuestions, List<String> keyTopics) {
        this.transcriptText = transcriptText;
        this.aiSummary = aiSummary;
        this.topQuestions = List.copyOf(topQuestions);
        this.keyTopics = List.copyOf(keyTopics);
        this.aiSummaryStatus = AISummaryStatus.DONE;
        this.updatedAt = LocalDateTime.now();
    }

    public void markFailed() {
        this.aiSummaryStatus = AISummaryStatus.FAILED;
        this.updatedAt = LocalDateTime.now();
    }

    // Defensive copy — override getter do Lombok
    public List<String> getTopQuestions() {
        return topQuestions != null ? List.copyOf(topQuestions) : List.of();
    }

    public List<String> getKeyTopics() {
        return keyTopics != null ? List.copyOf(keyTopics) : List.of();
    }

    // Setter riêng để đảm bảo defensive copy khi mapper restore
    public void setTopQuestions(List<String> v) {
        this.topQuestions = v != null ? List.copyOf(v) : List.of();
    }

    public void setKeyTopics(List<String> v) {
        this.keyTopics = v != null ? List.copyOf(v) : List.of();
    }
}