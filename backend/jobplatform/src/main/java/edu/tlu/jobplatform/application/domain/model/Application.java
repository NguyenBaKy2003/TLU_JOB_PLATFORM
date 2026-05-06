package edu.tlu.jobplatform.application.domain.model;

import edu.tlu.jobplatform.application.domain.model.vo.AIScore;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Aggregate Root: Đơn ứng tuyển.
 *
 * 1 ứng viên chỉ được nộp 1 đơn vào 1 bài đăng.
 * Lifecycle được quản lý chặt chẽ qua ApplicationStatus transitions.
 */
@Getter
@Builder
public class Application {

    private final UUID id;
    private final UUID jobPostId;
    private final UUID candidateId;
    private final UUID companyId; // denormalized để query nhanh

    // ── Nội dung ứng tuyển
    private final String cvUrl; // URL file CV đã upload
    private String coverLetter; // Thư xin việc (optional)
    private String expectedSalary; // Mức lương kỳ vọng

    // ── Trạng thái
    private ApplicationStatus status;
    private String rejectionReason; // Lý do từ chối (nếu có)

    // ── Phỏng vấn ─
    private LocalDateTime interviewScheduledAt;
    private String interviewLocation; // "Online - Google Meet" / "VP HN"
    private String interviewNote;

    // ── AI Scoring
    private AIScore aiScore; // null nếu chưa tính
    private boolean aiScoreCalculated;

    // ── Metadata ──
    private final LocalDateTime appliedAt;
    private LocalDateTime updatedAt;

    // ── Business Rules ─

    /** Employer chuyển trạng thái đơn */
    public void updateStatus(ApplicationStatus newStatus, String note) {
        status.assertCanTransitionTo(newStatus);
        this.status = newStatus;
        this.updatedAt = LocalDateTime.now();
        if (newStatus == ApplicationStatus.REJECTED && note != null)
            this.rejectionReason = note;
    }

    /** Ứng viên rút đơn */
    public void withdraw() {
        if (status.isTerminal())
            throw new BusinessRuleException(
                    "Không thể rút đơn ở trạng thái hiện tại: " + status,
                    "CANNOT_WITHDRAW");
        status.assertCanTransitionTo(ApplicationStatus.WITHDRAWN);
        this.status = ApplicationStatus.WITHDRAWN;
        this.updatedAt = LocalDateTime.now();
    }

    /** Lên lịch phỏng vấn */
    public void scheduleInterview(LocalDateTime scheduledAt, String location, String note) {
        status.assertCanTransitionTo(ApplicationStatus.INTERVIEW_SCHEDULED);
        this.status = ApplicationStatus.INTERVIEW_SCHEDULED;
        this.interviewScheduledAt = scheduledAt;
        this.interviewLocation = location;
        this.interviewNote = note;
        this.updatedAt = LocalDateTime.now();
    }

    /** Gắn điểm AI sau khi tính xong */
    public void attachAIScore(AIScore score) {
        this.aiScore = score;
        this.aiScoreCalculated = true;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isActive() {
        return !status.isTerminal();
    }

    public boolean hasAIScore() {
        return aiScoreCalculated && aiScore != null;
    }

    public void acceptOffer() {
        status.assertCanTransitionTo(ApplicationStatus.ACCEPTED);
        this.status = ApplicationStatus.ACCEPTED;
        this.updatedAt = LocalDateTime.now();
    }

    /** Ứng viên từ chối offer */
    public void declineOffer(String reason) {
        status.assertCanTransitionTo(ApplicationStatus.DECLINED);
        this.status = ApplicationStatus.DECLINED;
        this.rejectionReason = reason;
        this.updatedAt = LocalDateTime.now();
    }
}