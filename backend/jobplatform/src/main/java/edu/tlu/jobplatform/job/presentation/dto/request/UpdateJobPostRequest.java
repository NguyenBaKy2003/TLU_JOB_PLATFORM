package edu.tlu.jobplatform.job.presentation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

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

        @Min(0)
        @Max(30)
        private Integer experienceYears;

        @Min(1)
        private Integer vacancies;

        private LocalDate deadline;

        @Valid
        @Schema(description = "null = giữ nguyên, [] = xóa hết, [...] = thay toàn bộ")
        private List<SkillRequest> skills;

        @Data
        public static class SkillRequest {
                @NotBlank(message = "Tên skill không được để trống")
                @Size(max = 100)
                private String skillName;
                private String level;
                private boolean required = true;
        }
}