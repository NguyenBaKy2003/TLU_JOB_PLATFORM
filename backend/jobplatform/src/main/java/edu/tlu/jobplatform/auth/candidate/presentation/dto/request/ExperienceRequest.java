package edu.tlu.jobplatform.auth.candidate.presentation.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ExperienceRequest {
    @NotBlank
    @Size(max = 255)
    private String companyName;
    @NotBlank
    @Size(max = 255)
    private String position;
    @Size(max = 2000)
    private String description;
    @NotNull
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean current;
}