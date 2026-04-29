package edu.tlu.jobplatform.livestream.domain.model.vo;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;

import java.util.Set;
import java.util.Map;

public enum SessionStatus {
    SCHEDULED,
    LIVE,
    ENDED,
    CANCELLED;

    private static final Map<SessionStatus, Set<SessionStatus>> TRANSITIONS = Map.of(
            SCHEDULED, Set.of(LIVE, CANCELLED),
            LIVE, Set.of(ENDED),
            ENDED, Set.of(),
            CANCELLED, Set.of());

    public void validateTransitionTo(SessionStatus next) {
        if (!TRANSITIONS.get(this).contains(next)) {
            throw new BusinessRuleException(
                    String.format("Không thể chuyển trạng thái từ %s sang %s", this, next),
                    "STREAM_INVALID_STATUS_TRANSITION");
        }
    }
}