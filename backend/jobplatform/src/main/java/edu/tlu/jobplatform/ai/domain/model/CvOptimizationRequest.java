package edu.tlu.jobplatform.ai.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * Domain model: Yêu cầu AI tối ưu CV theo một JD cụ thể.
 *
 * Tương tự JdOptimizationRequest nhưng chiều ngược lại:
 * - JdOptimizationRequest : Employer muốn AI viết JD tốt hơn
 * - CvOptimizationRequest : Candidate muốn AI gợi ý tối ưu CV theo JD
 *
 * cvText là plain text đã serialize từ OnlineCV (các section visible,
 * thông tin cá nhân) — không phải file PDF URL, vì OnlineCV lưu
 * structured data chứ không phải file.
 */
@Getter
@Builder
public class CvOptimizationRequest {

    /** ID CV — chỉ dùng để log/trace, không gọi repo trong domain */
    private final UUID cvId;

    /** Nội dung CV dạng plain text (serialized từ OnlineCV sections) */
    private final String cvText;

    /** Tên vị trí ứng tuyển */
    private final String jobTitle;

    /** Mô tả công việc (đã strip HTML) */
    private final String jobDescription;

    /** Yêu cầu công việc (đã strip HTML) */
    private final String jobRequirements;

    /** Phúc lợi (optional — context thêm cho AI) */
    private final String jobBenefits;

    /**
     * Ngôn ngữ output mong muốn.
     * Mặc định "vi" (tiếng Việt).
     * Truyền "en" nếu JD bằng tiếng Anh.
     */
    @Builder.Default
    private final String outputLanguage = "vi";
}