package edu.tlu.jobplatform.admin.presentation.dto.request;

import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OverrideStatusRequest {

    @NotNull(message = "Status không được null")
    private ApplicationStatus status;

    private String reason;
}