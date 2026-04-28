package edu.tlu.jobplatform.auth.candidate.presentation.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EducationRequest {
    @NotBlank
    @Size(max = 255)
    private String school;
    @Size(max = 255)
    private String major;
    private String degree; // BACHELOR | MASTER | PHD | OTHER
    @NotNull
    private LocalDate startDate;
    private LocalDate endDate;
    @Size(max = 2000)
    private String description;
}