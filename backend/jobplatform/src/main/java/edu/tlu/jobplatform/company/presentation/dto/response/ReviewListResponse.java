package edu.tlu.jobplatform.company.presentation.dto.response;

import edu.tlu.jobplatform.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Response danh sách đánh giá kèm thống kê")
public class ReviewListResponse {

    @Schema(description = "Thống kê tổng quan")
    private ReviewStatsResponse stats;

    @Schema(description = "Danh sách đánh giá có phân trang")
    private PageResponse<ReviewResponse> reviews;
}