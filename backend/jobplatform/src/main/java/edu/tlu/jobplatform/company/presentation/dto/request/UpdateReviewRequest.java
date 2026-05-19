package edu.tlu.jobplatform.company.presentation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
@Schema(description = "Request cập nhật đánh giá công ty")
public class UpdateReviewRequest {

    @Min(value = 1, message = "Đánh giá phải từ 1 đến 5 sao")
    @Max(value = 5, message = "Đánh giá phải từ 1 đến 5 sao")
    @Schema(description = "Số sao đánh giá (1-5)", example = "5", minimum = "1", maximum = "5")
    private int rating;

    @Size(max = 200, message = "Tiêu đề không được vượt quá 200 ký tự")
    @Schema(description = "Tiêu đề đánh giá", example = "Môi trường làm việc tuyệt vời", maxLength = 200)
    private String title;

    @Schema(description = "Nội dung chi tiết đánh giá", example = "Sau một thời gian làm việc, tôi thấy...")
    private String content;

    @Schema(description = "Điểm tốt của công ty", example = "Cơ hội thăng tiến rõ ràng")
    private String pros;

    @Schema(description = "Điểm chưa tốt của công ty", example = "Cần cải thiện chế độ đào tạo")
    private String cons;
}