package edu.tlu.jobplatform.company.presentation.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Thống kê đánh giá của công ty")
public class ReviewStatsResponse {

    @Schema(description = "Điểm đánh giá trung bình", example = "4.2")
    private double averageRating;

    @Schema(description = "Tổng số lượng đánh giá đã được duyệt", example = "150")
    private long totalReviews;

    @Schema(description = "Số lượng đánh giá 5 sao", example = "80")
    private long fiveStarCount;

    @Schema(description = "Số lượng đánh giá 4 sao", example = "40")
    private long fourStarCount;

    @Schema(description = "Số lượng đánh giá 3 sao", example = "20")
    private long threeStarCount;

    @Schema(description = "Số lượng đánh giá 2 sao", example = "7")
    private long twoStarCount;

    @Schema(description = "Số lượng đánh giá 1 sao", example = "3")
    private long oneStarCount;

    /**
     * Tính phần trăm cho từng mức rating
     */
    public double getFiveStarPercentage() {
        return totalReviews > 0 ? Math.round((fiveStarCount * 1000.0) / totalReviews) / 10.0 : 0;
    }

    public double getFourStarPercentage() {
        return totalReviews > 0 ? Math.round((fourStarCount * 1000.0) / totalReviews) / 10.0 : 0;
    }

    public double getThreeStarPercentage() {
        return totalReviews > 0 ? Math.round((threeStarCount * 1000.0) / totalReviews) / 10.0 : 0;
    }

    public double getTwoStarPercentage() {
        return totalReviews > 0 ? Math.round((twoStarCount * 1000.0) / totalReviews) / 10.0 : 0;
    }

    public double getOneStarPercentage() {
        return totalReviews > 0 ? Math.round((oneStarCount * 1000.0) / totalReviews) / 10.0 : 0;
    }
}