package edu.tlu.jobplatform.job.domain.model.vo;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;

import java.util.Set;

/**
 * Enum: Vòng đời của một JobPost.
 *
 * Transitions hợp lệ:
 *
 * DRAFT ──────────────→ PUBLISHED (employer publish)
 * DRAFT ──────────────→ DELETED (employer xoá)
 * PUBLISHED ──────────→ CLOSED (employer đóng)
 * PUBLISHED ──────────→ EXPIRED (scheduler, hết hạn)
 * PUBLISHED ──────────→ DELETED (employer xoá)
 * CLOSED ─────────────→ PUBLISHED (employer mở lại, tốn quota)
 * EXPIRED ────────────→ PUBLISHED (employer gia hạn, tốn quota)
 */
public enum JobStatus {
    DRAFT,
    PUBLISHED,
    CLOSED,
    EXPIRED,
    DELETED;

    private static final java.util.Map<JobStatus, Set<JobStatus>> VALID_TRANSITIONS = java.util.Map.of(
            DRAFT, Set.of(PUBLISHED, DELETED),
            PUBLISHED, Set.of(CLOSED, EXPIRED, DELETED),
            CLOSED, Set.of(PUBLISHED, DELETED),
            EXPIRED, Set.of(PUBLISHED, DELETED),
            DELETED, Set.of());

    public void validateTransitionTo(JobStatus next) {
        if (!VALID_TRANSITIONS.getOrDefault(this, Set.of()).contains(next)) {
            throw new BusinessRuleException(
                    "Không thể chuyển trạng thái từ " + this + " sang " + next + ".",
                    "INVALID_JOB_STATUS_TRANSITION");
        }
    }

    public boolean isVisible() {
        return this == PUBLISHED;
    }

    public boolean isEditable() {
        return this == DRAFT || this == CLOSED || this == EXPIRED;
    }
}