package edu.tlu.jobplatform.shared.event.review;

import lombok.Getter;

import java.util.UUID;

@Getter
public class ReviewUpdatedEvent {
    private final UUID reviewId;
    private final UUID companyId;
    private final UUID companyOwnerId;
    private final UUID reviewerId;
    private final String message;

    public ReviewUpdatedEvent(UUID reviewId, UUID companyId, UUID companyOwnerId,
            UUID reviewerId, String message) {
        this.reviewId = reviewId;
        this.companyId = companyId;
        this.companyOwnerId = companyOwnerId;
        this.reviewerId = reviewerId;
        this.message = message;
    }
}