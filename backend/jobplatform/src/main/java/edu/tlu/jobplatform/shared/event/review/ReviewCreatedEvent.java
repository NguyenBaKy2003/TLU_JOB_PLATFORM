package edu.tlu.jobplatform.shared.event.review;

import lombok.Getter;

import java.util.UUID;

@Getter
public class ReviewCreatedEvent {
    private final UUID reviewId;
    private final UUID companyId;
    private final UUID companyOwnerId;
    private final UUID reviewerId;
    private final int rating;
    private final String reviewerName;
    private final boolean anonymous;

    public ReviewCreatedEvent(UUID reviewId, UUID companyId, UUID companyOwnerId,
            UUID reviewerId, int rating,
            String reviewerName, boolean anonymous) {
        this.reviewId = reviewId;
        this.companyId = companyId;
        this.companyOwnerId = companyOwnerId;
        this.reviewerId = reviewerId;
        this.rating = rating;
        this.reviewerName = reviewerName;
        this.anonymous = anonymous;
    }
}