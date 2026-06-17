package edu.tlu.jobplatform.application.domain.model.vo;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;

import java.util.Map;
import java.util.Set;

public enum ApplicationStatus {

    SUBMITTED,
    REVIEWING,
    SHORTLISTED,
    INTERVIEW_SCHEDULED,
    INTERVIEWED,
    OFFERED,
    ACCEPTED,
    DECLINED,
    HIRED,
    REJECTED,
    WITHDRAWN,
    CANCELLED;

    // Map.of() giới hạn 10 entries — dùng Map.ofEntries() cho 12 entries
    private static final Map<ApplicationStatus, Set<ApplicationStatus>> TRANSITIONS = Map.ofEntries(
            Map.entry(SUBMITTED, Set.of(REVIEWING, REJECTED, WITHDRAWN, CANCELLED)),
            Map.entry(REVIEWING, Set.of(SHORTLISTED, REJECTED, WITHDRAWN, CANCELLED)),
            Map.entry(SHORTLISTED, Set.of(INTERVIEW_SCHEDULED, REJECTED, WITHDRAWN, CANCELLED)),
            Map.entry(INTERVIEW_SCHEDULED, Set.of(INTERVIEWED, REJECTED, WITHDRAWN, CANCELLED)),
            Map.entry(INTERVIEWED, Set.of(OFFERED, REJECTED, CANCELLED)),
            Map.entry(OFFERED, Set.of(ACCEPTED, DECLINED, CANCELLED)),
            Map.entry(ACCEPTED, Set.of(HIRED, CANCELLED)),
            Map.entry(HIRED, Set.of()),
            Map.entry(REJECTED, Set.of()),
            Map.entry(WITHDRAWN, Set.of()),
            Map.entry(CANCELLED, Set.of()),
            Map.entry(DECLINED, Set.of()));

    public boolean canTransitionTo(ApplicationStatus target) {
        return TRANSITIONS.getOrDefault(this, Set.of()).contains(target);
    }

    public void assertCanTransitionTo(ApplicationStatus target) {
        if (!canTransitionTo(target))
            throw new BusinessRuleException(
                    String.format("Không thể chuyển trạng thái từ %s sang %s.", this, target),
                    "INVALID_APPLICATION_STATUS_TRANSITION");
    }

    public boolean isTerminal() {
        return this == HIRED || this == REJECTED
                || this == WITHDRAWN || this == CANCELLED || this == DECLINED;
    }

    public boolean isCandidateAction() {
        return this == WITHDRAWN || this == DECLINED;
    }

    public boolean isEmployerAction() {
        return !isCandidateAction() && this != SUBMITTED;
    }
}