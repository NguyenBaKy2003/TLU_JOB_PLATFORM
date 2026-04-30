package edu.tlu.jobplatform.livestream.domain.model;

import edu.tlu.jobplatform.livestream.domain.model.vo.*;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
public class LiveStreamSession {

    private final UUID id;
    private final UUID companyId;
    private final UUID hostUserId;

    private String title;
    private String description;
    private String thumbnailUrl;
    private SessionType sessionType;
    private SessionStatus status;

    private LocalDateTime scheduledAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    private int maxViewers;
    private int viewerCount;
    private boolean quotaConsumed;

    private List<InterviewSlot> interviewSlots;

    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private LiveStreamSession(UUID id, UUID companyId, UUID hostUserId) {
        this.id = id;
        this.companyId = companyId;
        this.hostUserId = hostUserId;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.interviewSlots = new ArrayList<>();
    }

    // ─── Factory methods ──────────────────────────────────────────────────────

    public static LiveStreamSession create(
            UUID companyId,
            UUID hostUserId,
            String title,
            String description,
            SessionType sessionType,
            LocalDateTime scheduledAt,
            int maxViewers,
            List<InterviewSlot> interviewSlots) {

        validateTitle(title);
        validateScheduledAt(scheduledAt);

        LiveStreamSession session = new LiveStreamSession(UUID.randomUUID(), companyId, hostUserId);
        session.title = title;
        session.description = description;
        session.sessionType = sessionType;
        session.status = SessionStatus.SCHEDULED;
        session.scheduledAt = scheduledAt;
        session.maxViewers = maxViewers;
        session.viewerCount = 0;
        session.quotaConsumed = false;
        session.interviewSlots = new ArrayList<>(interviewSlots);
        return session;
    }

    public static LiveStreamSession restore(
            UUID id,
            UUID companyId,
            UUID hostUserId,
            String title,
            String description,
            String thumbnailUrl,
            SessionType sessionType,
            SessionStatus status,
            LocalDateTime scheduledAt,
            LocalDateTime startedAt,
            LocalDateTime endedAt,
            int maxViewers,
            int viewerCount,
            boolean quotaConsumed,
            List<InterviewSlot> interviewSlots) {

        LiveStreamSession session = new LiveStreamSession(id, companyId, hostUserId);
        session.title = title;
        session.description = description;
        session.thumbnailUrl = thumbnailUrl;
        session.sessionType = sessionType;
        session.status = status;
        session.scheduledAt = scheduledAt;
        session.startedAt = startedAt;
        session.endedAt = endedAt;
        session.maxViewers = maxViewers;
        session.viewerCount = viewerCount;
        session.quotaConsumed = quotaConsumed;
        session.interviewSlots = new ArrayList<>(interviewSlots);
        return session;
    }

    // ─── Business methods ─────────────────────────────────────────────────────

    public void start() {
        status.validateTransitionTo(SessionStatus.LIVE);
        this.status = SessionStatus.LIVE;
        this.startedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void end() {
        status.validateTransitionTo(SessionStatus.ENDED);
        this.status = SessionStatus.ENDED;
        this.endedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void cancel() {
        status.validateTransitionTo(SessionStatus.CANCELLED);
        this.status = SessionStatus.CANCELLED;
        this.updatedAt = LocalDateTime.now();
    }

    public void markQuotaConsumed() {
        this.quotaConsumed = true;
        this.updatedAt = LocalDateTime.now();
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Sync viewer count trực tiếp từ in-memory manager.
     * Thay thế hoàn toàn vòng lặp increment/decrement cũ — không ném exception,
     * không phụ thuộc vào giá trị hiện tại của DB.
     *
     * @param count giá trị mới từ StreamViewerManager (đã được clamp >= 0)
     */
    public void syncViewerCount(int count) {
        this.viewerCount = Math.max(0, count);
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Chỉ dùng khi cần guard check maxViewers (ví dụ: lần đầu join qua HTTP).
     * Trong flow realtime (WebSocket), dùng syncViewerCount() thay thế.
     */
    public void incrementViewerCount() {
        if (viewerCount >= maxViewers) {
            throw new BusinessRuleException(
                    "Phiên stream đã đạt số lượng viewer tối đa",
                    "STREAM_MAX_VIEWERS_REACHED");
        }
        this.viewerCount++;
        this.updatedAt = LocalDateTime.now();
    }

    public void decrementViewerCount() {
        if (viewerCount > 0)
            this.viewerCount--;
        this.updatedAt = LocalDateTime.now();
    }

    public InterviewSlot assignSlotToCandidate(UUID slotId, UUID candidateId) {
        if (sessionType != SessionType.INTERVIEW) {
            throw new BusinessRuleException(
                    "Phiên JOB_FAIR không có interview slot",
                    "STREAM_INVALID_SESSION_TYPE");
        }
        InterviewSlot slot = findSlot(slotId);
        InterviewSlot assigned = slot.assignTo(candidateId);
        interviewSlots.set(interviewSlots.indexOf(slot), assigned);
        this.updatedAt = LocalDateTime.now();
        return assigned;
    }

    public boolean isLive() {
        return status == SessionStatus.LIVE;
    }

    public boolean isOwnedBy(UUID companyId) {
        return this.companyId.equals(companyId);
    }

    public boolean isHostedBy(UUID userId) {
        return this.hostUserId.equals(userId);
    }

    /** Defensive copy — override getter do Lombok tạo ra trả về list gốc. */
    public List<InterviewSlot> getInterviewSlots() {
        return List.copyOf(interviewSlots);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private InterviewSlot findSlot(UUID slotId) {
        return interviewSlots.stream()
                .filter(s -> s.slotId().equals(slotId))
                .findFirst()
                .orElseThrow(() -> new BusinessRuleException(
                        "Không tìm thấy interview slot: " + slotId,
                        "STREAM_SLOT_NOT_FOUND"));
    }

    private static void validateTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new BusinessRuleException(
                    "Tiêu đề phiên stream không được để trống",
                    "STREAM_TITLE_BLANK");
        }
        if (title.length() > 200) {
            throw new BusinessRuleException(
                    "Tiêu đề không được vượt quá 200 ký tự",
                    "STREAM_TITLE_TOO_LONG");
        }
    }

    private static void validateScheduledAt(LocalDateTime scheduledAt) {
        if (scheduledAt == null || scheduledAt.isBefore(LocalDateTime.now())) {
            throw new BusinessRuleException(
                    "Thời gian bắt đầu phải ở tương lai",
                    "STREAM_SCHEDULED_AT_INVALID");
        }
    }
}