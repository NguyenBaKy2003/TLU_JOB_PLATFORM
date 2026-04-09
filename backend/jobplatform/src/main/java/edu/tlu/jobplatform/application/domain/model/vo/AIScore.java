package edu.tlu.jobplatform.application.domain.model.vo;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * Value Object: Điểm AI đánh giá mức độ phù hợp của ứng viên.
 *
 * AI phân tích CV vs JD → trả về score + lý do.
 * Được tính bất đồng bộ sau khi ứng viên nộp đơn.
 */
@Getter
@Builder
public class AIScore {

    /** Điểm tổng (0-100) */
    private final int score;

    /** Điểm theo từng tiêu chí */
    private final int skillMatchScore; // kỹ năng phù hợp
    private final int experienceScore; // kinh nghiệm
    private final int educationScore; // học vấn

    /** Lý do AI đánh giá cao */
    private final List<String> strengths;

    /** Điểm còn thiếu */
    private final List<String> gaps;

    /** Nhận xét tổng quan của AI */
    private final String summary;

    /** Model AI sử dụng để tính điểm */
    private final String modelVersion;

    public boolean isHighScore() {
        return score >= 75;
    }

    public boolean isMediumScore() {
        return score >= 50 && score < 75;
    }

    public boolean isLowScore() {
        return score < 50;
    }

    public String getLabel() {
        if (isHighScore())
            return "Rất phù hợp";
        if (isMediumScore())
            return "Phù hợp";
        return "Ít phù hợp";
    }
}