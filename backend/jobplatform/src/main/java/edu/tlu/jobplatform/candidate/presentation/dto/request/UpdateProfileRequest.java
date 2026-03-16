package edu.tlu.jobplatform.candidate.presentation.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class UpdateProfileRequest {

    @Size(max = 255, message = "Headline tối đa 255 ký tự")
    private String headline;

    @Size(max = 2000, message = "Summary tối đa 2000 ký tự")
    private String summary;

    @Pattern(regexp = "^(\\+84|0)\\d{9}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Size(max = 255)
    private String location;

    private LocalDate dateOfBirth;

    private String gender;

    @Min(value = 0, message = "Mức lương không được âm")
    private int expectedSalary;

    private String currency;

    @Valid
    private List<SkillRequest> skills;

    @Data
    public static class SkillRequest {

        @NotBlank(message = "Tên kỹ năng không được để trống")
        @Size(max = 100)
        private String name;

        private String level;

        @Min(0)
        @Max(50)
        private int yearsOfExp;
    }
}