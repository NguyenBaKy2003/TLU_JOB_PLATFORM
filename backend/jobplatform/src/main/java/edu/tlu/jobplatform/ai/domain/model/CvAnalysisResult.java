package edu.tlu.jobplatform.ai.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * Kết quả phân tích CV từ OpenAI.
 * Jackson deserialize từ JSON response của model.
 *
 * JSON format mong đợi:
 * {
 * "overallScore": 82,
 * "skillMatchScore": 85,
 * "experienceScore": 78,
 * "educationScore": 80,
 * "strengths": ["Có 3 năm kinh nghiệm Java", "Thành thạo Spring Boot"],
 * "gaps": ["Chưa có kinh nghiệm Kubernetes"],
 * "summary": "Ứng viên phù hợp tốt với vị trí..."
 * }
 */
@Getter
@Builder
public class CvAnalysisResult {

    private final int overallScore; // 0-100
    private final int skillMatchScore;
    private final int experienceScore;
    private final int educationScore;
    private final List<String> strengths;
    private final List<String> gaps;
    private final String summary;
}