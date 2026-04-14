package edu.tlu.jobplatform.application.presentation.dto.response;

import edu.tlu.jobplatform.application.domain.model.ApplicationStatusLog;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class ApplicationStatusLogResponse {

    private final UUID id;
    private final ApplicationStatus fromStatus;
    private final ApplicationStatus toStatus;
    private final String note;
    private final UUID changedBy;
    private final LocalDateTime changedAt;

    public static ApplicationStatusLogResponse from(ApplicationStatusLog log) {
        return ApplicationStatusLogResponse.builder()
                .id(log.getId())
                .fromStatus(log.getFromStatus())
                .toStatus(log.getToStatus())
                .note(log.getNote())
                .changedBy(log.getChangedBy()) // bổ sung field này
                .changedAt(log.getChangedAt())
                .build();
    }
}