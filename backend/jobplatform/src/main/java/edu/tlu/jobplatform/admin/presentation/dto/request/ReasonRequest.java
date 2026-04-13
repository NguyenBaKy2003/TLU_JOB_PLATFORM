package edu.tlu.jobplatform.admin.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReasonRequest {

    @NotBlank(message = "Reason không được để trống")
    private String reason;
}