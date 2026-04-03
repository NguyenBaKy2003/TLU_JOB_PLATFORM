package edu.tlu.jobplatform.job.presentation.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/** PATCH semantics — tất cả nullable */
@Data
public class UpdateJobPostRequest {
        private String title;
        private String description;
        private String requirements;
        private String benefits;
        private String jobType;
        private String level;
        private String category;
        private BigDecimal salaryMin;
        private BigDecimal salaryMax;
        private String salaryCurrency;
        private Boolean salaryNegotiable;
        private String workLocationType;
        private String workLocationCity;
        private String workLocationAddress;
        private Integer experienceYears;
        private Integer vacancies;
        private LocalDate deadline;
}