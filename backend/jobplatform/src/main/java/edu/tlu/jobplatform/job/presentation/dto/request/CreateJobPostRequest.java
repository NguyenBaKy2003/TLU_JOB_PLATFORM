package edu.tlu.jobplatform.job.presentation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Schema(description = "Tạo bài đăng tuyển dụng")
public class CreateJobPostRequest {

        @NotBlank(message = "Tiêu đề không được để trống")
        @Size(max = 300)
        @Schema(example = "Senior Backend Developer (Java)")
        private String title;

        @Size(min = 100, message = "Mô tả phải có ít nhất 100 ký tự")
        private String description;

        private String requirements;
        private String benefits;

        @Schema(example = "FULL_TIME", allowableValues = { "FULL_TIME", "PART_TIME", "CONTRACT", "INTERN" })
        private String jobType;

        @Schema(example = "SENIOR", allowableValues = { "INTERN", "JUNIOR", "MIDDLE", "SENIOR", "LEAD", "MANAGER" })
        private String level;

        @Schema(example = "Công nghệ thông tin")
        private String category;

        // ── Salary ────
        @Schema(example = "20000000")
        private BigDecimal salaryMin;

        @Schema(example = "35000000")
        private BigDecimal salaryMax;

        @Schema(example = "VND")
        private String salaryCurrency;

        @Schema(example = "false", description = "true = Thoả thuận")
        private boolean salaryNegotiable;

        // ── WorkLocation ──────────────────────────────────────────
        @Schema(example = "ONSITE", allowableValues = { "ONSITE", "REMOTE", "HYBRID" })
        private String workLocationType;

        @Schema(example = "Hà Nội")
        private String workLocationCity;

        private String workLocationAddress;

        // ── Điều kiện ─
        @Min(0)
        @Max(30)
        private Integer experienceYears;

        @Min(1)
        private Integer vacancies;

        @Future(message = "Hạn nộp CV phải là ngày trong tương lai")
        @NotNull(message = "Vui lòng chọn hạn nộp CV")
        private LocalDate deadline;

        // ── Skills ────
        @Valid
        @Schema(description = "Danh sách kỹ năng yêu cầu")
        private List<SkillRequest> skills;

        @Data
        public static class SkillRequest {

                @NotBlank(message = "Tên skill không được để trống")
                @Size(max = 100)
                @Schema(example = "Java")
                private String skillName;

                @Schema(example = "Nâng cao", allowableValues = { "Cơ bản", "Trung cấp", "Nâng cao" })
                private String level;

                @Schema(example = "true", description = "true = bắt buộc, false = không bắt buộc")
                private boolean required = true;
        }
}