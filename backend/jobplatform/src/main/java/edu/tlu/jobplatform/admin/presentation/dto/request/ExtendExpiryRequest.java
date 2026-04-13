package edu.tlu.jobplatform.admin.presentation.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExtendExpiryRequest {

    @NotNull(message = "Days không được null")
    @Min(value = 1, message = "Days phải >= 1")
    private Integer days;

    @NotBlank(message = "Reason không được để trống")
    private String reason;
}