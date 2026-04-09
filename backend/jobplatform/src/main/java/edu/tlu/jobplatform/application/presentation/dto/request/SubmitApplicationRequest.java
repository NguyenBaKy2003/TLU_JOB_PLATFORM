package edu.tlu.jobplatform.application.presentation.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Nộp đơn ứng tuyển")
public class SubmitApplicationRequest {

    @NotBlank(message = "URL CV không được để trống")
    @Schema(example = "https://storage.example.com/cv/nguyen-ba-ky.pdf")
    private String cvUrl;

    @Size(max = 3000)
    @Schema(description = "Thư xin việc")
    private String coverLetter;

    @JsonAlias("salary")
    @Schema(example = "25-35 triệu VND")
    private String expectedSalary;
}