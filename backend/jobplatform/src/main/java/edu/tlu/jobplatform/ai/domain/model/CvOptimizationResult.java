package edu.tlu.jobplatform.ai.domain.model;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

/**
 * Domain model: Kết quả AI tối ưu CV.
 *
 * Deserialized từ JSON response của LLM.
 * Tất cả field đều nullable để tránh crash khi AI trả thiếu field.
 *
 * Jackson cần @NoArgsConstructor + @AllArgsConstructor để deserialize.
 * Dùng pattern giống JdOptimizationResult.
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CvOptimizationResult {

    /**
     * Tóm tắt tổng thể mức độ phù hợp.
     * VD: "CV phù hợp khoảng 65%. Bạn có kinh nghiệm Java nhưng thiếu
     * kỹ năng Kubernetes và kinh nghiệm microservices được JD yêu cầu."
     */
    private String overallSummary;

    /**
     * Đề xuất viết lại phần Summary/Mục tiêu nghề nghiệp.
     * Đây là đoạn text hoàn chỉnh có thể paste trực tiếp vào CV.
     */
    private String suggestedSummary;

    /**
     * Kỹ năng nên thêm vào CV dựa trên JD.
     * Chỉ liệt kê kỹ năng candidate có thể thực sự có
     * (AI không tự bịa kỹ năng).
     */
    private List<String> skillsToAdd;

    /**
     * Kỹ năng trong CV nhưng không liên quan JD này.
     * Candidate có thể cân nhắc ẩn đi khi ứng tuyển vị trí này.
     */
    private List<String> skillsToRemove;

    /**
     * Gợi ý cụ thể cách viết lại từng mục kinh nghiệm.
     * Mỗi item là một gợi ý dạng: "Thay 'phát triển web' bằng
     * 'xây dựng REST API với Spring Boot, xử lý 10k req/s'"
     */
    private List<String> experienceSuggestions;

    /**
     * Từ khóa quan trọng trong JD mà CV đang thiếu hoàn toàn.
     * Candidate nên tìm cách tự nhiên đưa vào CV nếu thực sự có.
     */
    private List<String> missingKeywords;

    /**
     * Điểm phù hợp tổng thể (0–100).
     * Giúp candidate có con số tham chiếu trước khi tối ưu.
     */
    private Integer matchScore;
}