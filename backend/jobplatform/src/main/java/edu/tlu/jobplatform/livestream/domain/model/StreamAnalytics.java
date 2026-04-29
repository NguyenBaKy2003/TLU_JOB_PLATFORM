package edu.tlu.jobplatform.livestream.domain.model;

import edu.tlu.jobplatform.livestream.domain.model.vo.HeatmapPoint;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
public class StreamAnalytics {

    private final UUID id;
    private final UUID sessionId;

    @Setter
    private int peakViewerCount;
    @Setter
    private long totalWatchSeconds;
    @Setter
    private int applyClickCount;
    @Setter
    private int cvViewCount;
    @Setter
    private int pollResponseCount;
    @Setter
    private int qaQuestionCount;

    private List<HeatmapPoint> dropOffHeatmap;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static StreamAnalytics createFor(UUID sessionId) {
        StreamAnalytics a = new StreamAnalytics(UUID.randomUUID(), sessionId);
        a.dropOffHeatmap = new ArrayList<>();
        return a;
    }

    private StreamAnalytics(UUID id, UUID sessionId) {
        this.id = id;
        this.sessionId = sessionId;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void updatePeakViewers(int current) {
        if (current > peakViewerCount) {
            this.peakViewerCount = current;
            this.updatedAt = LocalDateTime.now();
        }
    }

    public void addWatchTime(long seconds) {
        this.totalWatchSeconds += seconds;
        this.updatedAt = LocalDateTime.now();
    }

    public void recordApplyClick() {
        this.applyClickCount++;
        this.updatedAt = LocalDateTime.now();
    }

    public void recordCvView() {
        this.cvViewCount++;
        this.updatedAt = LocalDateTime.now();
    }

    public void recordPollResponse() {
        this.pollResponseCount++;
        this.updatedAt = LocalDateTime.now();
    }

    public void recordQaQuestion() {
        this.qaQuestionCount++;
        this.updatedAt = LocalDateTime.now();
    }

    public void addHeatmapPoint(int second, int viewerCount) {
        this.dropOffHeatmap.add(new HeatmapPoint(second, viewerCount));
        this.updatedAt = LocalDateTime.now();
    }

    public long getAvgWatchSeconds(int totalViewers) {
        if (totalViewers == 0)
            return 0;
        return totalWatchSeconds / totalViewers;
    }

    // Defensive copy — override getter do Lombok
    public List<HeatmapPoint> getDropOffHeatmap() {
        return List.copyOf(dropOffHeatmap);
    }

    public void setDropOffHeatmap(List<HeatmapPoint> v) {
        this.dropOffHeatmap = new ArrayList<>(v);
        this.updatedAt = LocalDateTime.now();
    }
}