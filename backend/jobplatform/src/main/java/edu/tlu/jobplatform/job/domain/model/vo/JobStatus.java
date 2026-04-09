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
 * PUBLISHED → EXPIRED (system tự động khi hết hạn)
 * CLOSED → PUBLISHED (employer mở lại — consume quota mới)
 * EXPIRED → PUBLISHED (employer gia hạn)
 */
public enum JobStatus {

    DRAFT, // Nháp — chưa hiển thị
    PUBLISHED, // Đang hiển thị — nhận CV
    CLOSED, // Đóng thủ công — không nhận CV
    EXPIRED, // Hết hạn tự động
    DELETED; // Đã xóa (soft delete)

    private static final java.util.Map<JobStatus, Set<JobStatus>> TRANSITIONS = java.util.Map.of(
            DRAFT, Set.of(PUBLISHED, DELETED),
            PUBLISHED, Set.of(CLOSED, EXPIRED),
            CLOSED, Set.of(PUBLISHED, DELETED),
            EXPIRED, Set.of(PUBLISHED, DELETED),
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
        return this == DRAFT || this == CLOSED || this == EXPIRED;
    }

}