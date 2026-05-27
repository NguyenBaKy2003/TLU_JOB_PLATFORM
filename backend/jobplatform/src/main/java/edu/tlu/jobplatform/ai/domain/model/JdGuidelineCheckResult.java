package edu.tlu.jobplatform.ai.domain.model;

import lombok.*;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class JdGuidelineCheckResult {

    public enum Severity {
        CLEAN, WARNING, VIOLATION, ERROR, CRITICAL
    }

    public enum ViolationType {
        DISCRIMINATION, // phân biệt giới tính, độ tuổi, ngoại hình
        MISLEADING_SALARY, // lương ảo, không rõ ràng
        ILLEGAL_REQUIREMENT, // yêu cầu phi pháp
        TOXIC_LANGUAGE, // ngôn ngữ kỳ thị, thiếu tôn trọng
        UNREALISTIC_DEMAND // yêu cầu bất hợp lý (intern cần 5 năm kinh nghiệm)
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Violation {
        private ViolationType type;
        private String excerpt; // đoạn text vi phạm
        private String explanation; // giải thích tại sao vi phạm
        private String suggestion; // gợi ý sửa
    }

    private boolean passed;
    private Severity severity; // CLEAN / WARNING / VIOLATION
    private List<Violation> violations;
    private String cleanedVersion; // AI tự sửa lại bản sạch
    private String overallFeedback; // nhận xét tổng thể
    private int qualityScore; // 0-100

    public boolean hasBlockingIssues() {
        return severity == Severity.ERROR || severity == Severity.CRITICAL;

    }
}