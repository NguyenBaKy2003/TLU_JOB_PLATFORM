package edu.tlu.jobplatform.company.presentation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request từ chối đánh giá")
public class RejectReviewRequest {

    @NotBlank(message = "Lý do từ chối không được để trống")
    @Size(min = 10, message = "Lý do từ chối phải có ít nhất 10 ký tự")
    @Size(max = 500, message = "Lý do từ chối không được vượt quá 500 ký tự")
    @Schema(description = "Lý do từ chối đánh giá", example = "Nội dung đánh giá chứa thông tin không chính xác và có dấu hiệu xúc phạm nhân viên công ty", minLength = 10, maxLength = 500)
    private String reason;
}