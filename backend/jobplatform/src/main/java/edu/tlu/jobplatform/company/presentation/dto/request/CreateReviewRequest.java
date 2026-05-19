package edu.tlu.jobplatform.company.presentation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
@Schema(description = "Tạo đánh giá công ty")
public class CreateReviewRequest {

    @Min(1)
    @Max(5)
    @Schema(example = "4")
    private int rating;

    @Size(max = 200)
    @Schema(example = "Môi trường làm việc tốt")
    private String title;

    @Size(max = 2000)
    private String content;

    @Size(max = 1000)
    @Schema(description = "Điểm tốt")
    private String pros;

    @Size(max = 1000)
    @Schema(description = "Điểm chưa tốt")
    private String cons;

    private boolean anonymous;
    private boolean employed;
}