package edu.tlu.jobplatform.shared.event.candidate;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

/**
 * Ứng viên cập nhật thông tin profile (headline, skills, experience...).
 *
 * Consumers:
 *   - AI domain → cập nhật ai_profile_vector embedding
 */
@Getter
public class ProfileUpdatedEvent extends DomainEvent {

    private final UUID   candidateId;

    /** Text tổng hợp từ headline + skills + experience — AI dùng để re-embed */
    private final String profileSummaryText;

    public ProfileUpdatedEvent(UUID candidateId, String profileSummaryText) {
        super();
        this.candidateId        = candidateId;
        this.profileSummaryText = profileSummaryText;
    }
}
