package edu.tlu.jobplatform.notification.infrastructure.event;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReviewNotification {

    private String type; // REVIEW_CREATED, REVIEW_APPROVED, REVIEW_REJECTED, REVIEW_UPDATED
    private UUID reviewId;
    private String message;
    private Integer rating;
    private String reason;

    @Builder.Default
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    private LocalDateTime timestamp = LocalDateTime.now();
}