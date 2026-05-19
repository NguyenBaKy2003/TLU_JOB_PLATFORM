package edu.tlu.jobplatform.shared.event.review;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class ReviewApprovedEvent extends ApplicationEvent {
    private final UUID reviewId;
    private final UUID companyId;
    private final UUID reviewerId;
    private final int rating;
    private final String message;

    public ReviewApprovedEvent(UUID reviewId, UUID companyId, UUID reviewerId,
            int rating, String message) {
        super(reviewId);
        this.reviewId = reviewId;
        this.companyId = companyId;
        this.reviewerId = reviewerId;
        this.rating = rating;
        this.message = message;
    }
}