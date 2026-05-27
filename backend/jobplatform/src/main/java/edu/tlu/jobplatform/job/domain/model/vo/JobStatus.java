package edu.tlu.jobplatform.job.domain.model.vo;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;

import java.util.Set;

/**
 * Trạng thái bài đăng tuyển dụng với transition rules.
 *
 * Flow hợp lệ:
 * DRAFT → PUBLISHED (employer publish)
 * DRAFT → DELETED (employer xóa)
 * PUBLISHED → CLOSED (employer đóng thủ công)
 * PENDING_REVIEW, // ← MỚI: chờ kiểm duyệt
 * PUBLISHED → EXPIRED (system tự động khi hết hạn)
 * CLOSED → PUBLISHED (employer mở lại — consume quota mới)
 * EXPIRED → PUBLISHED (employer gia hạn)
 * REJECTED, // ← MỚI: bị từ chối, kèm lý do
 */
public enum JobStatus {

    DRAFT,
    PENDING_REVIEW, // chờ kiểm duyệt
    PUBLISHED,
    REJECTED, // bị từ chối, kèm lý do
    CLOSED,
    EXPIRED,
    DELETED;

    private static final java.util.Map<JobStatus, Set<JobStatus>> TRANSITIONS = java.util.Map.of(
            DRAFT, Set.of(PENDING_REVIEW, DELETED),
            PENDING_REVIEW, Set.of(PUBLISHED, REJECTED),
            PUBLISHED, Set.of(CLOSED, EXPIRED),
            REJECTED, Set.of(PENDING_REVIEW, DELETED),
            CLOSED, Set.of(PENDING_REVIEW, DELETED),
            EXPIRED, Set.of(PENDING_REVIEW, DELETED),
            DELETED, Set.of());

    public boolean canTransitionTo(JobStatus target) {
        return TRANSITIONS.getOrDefault(this, Set.of()).contains(target);
    }

    public void assertCanTransitionTo(JobStatus target) {
        if (!canTransitionTo(target))
            throw new BusinessRuleException(
                    String.format("Không thể chuyển từ %s sang %s.", this, target),
                    "INVALID_JOB_STATUS_TRANSITION");
    }

    public boolean isActive() {
        return this == PUBLISHED;
    }

    public boolean isEditable() {
        return this == DRAFT || this == REJECTED || this == CLOSED || this == EXPIRED;
    }
}