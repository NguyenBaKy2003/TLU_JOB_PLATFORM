package edu.tlu.jobplatform.shared.event.review;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class ReviewRejectedEvent extends ApplicationEvent {
    private final UUID reviewId;
    private final UUID companyId;
    private final UUID reviewerId;
    private final String reason;
    private final String message;

    public ReviewRejectedEvent(UUID reviewId, UUID companyId, UUID reviewerId,
            String reason, String message) {
        super(reviewId);
        this.reviewId = reviewId;
        this.companyId = companyId;
        this.reviewerId = reviewerId;
        this.reason = reason;
        this.message = message;
    }
}