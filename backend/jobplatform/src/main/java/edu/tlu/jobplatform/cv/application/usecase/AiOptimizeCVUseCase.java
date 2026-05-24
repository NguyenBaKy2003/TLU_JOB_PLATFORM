package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.ai.domain.model.CvOptimizationRequest;
import edu.tlu.jobplatform.ai.domain.model.CvOptimizationResult;
import edu.tlu.jobplatform.cv.application.port.out.AiCvOptimizePort;
import edu.tlu.jobplatform.cv.domain.model.CVSection;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.service.CVDomainService;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.subscription.application.usecase.CheckCandidateQuotaUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * UseCase: AI tối ưu CV theo một JD cụ thể.
 *
 * Tính năng chỉ dành cho gói PREMIUM (aiCvWriter = true).
 *
 * Flow:
 * 1. Check feature flag aiCvWriter từ CandidateSubscription
 * 2. Load CV + verify ownership
 * 3. Load JobPost để lấy JD text
 * 4. Serialize CV thành plain text → build CvOptimizationRequest
 * 5. Gọi AiCvOptimizePort → trả về CvOptimizationResult
 *
 * Candidate tự quyết định áp dụng gợi ý nào — UseCase KHÔNG tự sửa CV.
 *
 * Lý do không tự sửa CV:
 * - Tránh mất dữ liệu nếu AI gợi ý sai
 * - Candidate cần review trước khi commit thay đổi
 * - Tách biệt "đề xuất" và "áp dụng" → UX tốt hơn
 *
 * Quota: aiCvWriter là feature flag (boolean), không phải quota đếm số lần.
 * Nếu muốn giới hạn số lần gọi AI/tháng, thêm aiOptimizeQuota sau.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiOptimizeCVUseCase {

    private final CVDomainService cvDomainService;
    private final JobPostRepository jobPostRepository;
    private final AiCvOptimizePort aiCvOptimizePort;
    private final CheckCandidateQuotaUseCase checkQuotaUseCase;

    @Transactional(readOnly = true)
    public CvOptimizationResult execute(Command cmd) {

        // 1. Check feature flag — phải là PREMIUM
        CheckCandidateQuotaUseCase.Result quota = checkQuotaUseCase.execute(cmd.candidateId());

        if (!quota.hasActiveSubscription() || !quota.aiCvWriter()) {
            throw new BusinessRuleException(
                    "Tính năng AI viết CV chỉ có trong gói PREMIUM. " +
                            "Vui lòng nâng cấp gói để sử dụng.",
                    "AI_CV_WRITER_NOT_AVAILABLE");
        }

        // 2. Load CV + verify ownership
        OnlineCV cv = cvDomainService.loadAndVerifyOwnership(cmd.cvId(), cmd.candidateId());

        // 3. Load JobPost
        JobPost job = jobPostRepository.findById(cmd.jobPostId())
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", cmd.jobPostId()));

        // 4. Serialize CV → plain text để gửi cho AI
        String cvText = serializeCvToText(cv);

        // 5. Parse các field JD từ toFullText()
        String jobFullText = job.toFullText();
        String jobTitle = parseSection(jobFullText, "Vị trí: ");
        String jobDesc = parseSection(jobFullText, "Mô tả: ");
        String jobReqs = parseSection(jobFullText, "Yêu cầu: ");
        String jobBenefits = parseSection(jobFullText, "Phúc lợi: ");

        log.info("[AiOptimizeCV] Optimizing: cvId={} jobPostId={} candidateId={}",
                cmd.cvId(), cmd.jobPostId(), cmd.candidateId());

        // 6. Build request và gọi AI port
        CvOptimizationRequest request = CvOptimizationRequest.builder()
                .cvId(cmd.cvId())
                .cvText(cvText)
                .jobTitle(jobTitle)
                .jobDescription(jobDesc)
                .jobRequirements(jobReqs)
                .jobBenefits(jobBenefits)
                .outputLanguage("vi")
                .build();

        CvOptimizationResult result = aiCvOptimizePort.optimize(request);

        log.info("[AiOptimizeCV] Done: cvId={} missingKeywords={} matchScore={}",
                cmd.cvId(),
                result.getMissingKeywords() != null ? result.getMissingKeywords().size() : 0,
                result.getMatchScore());

        return result;
    }

    /**
     * Serialize OnlineCV → plain text để AI đọc được.
     * Format: tiêu đề section + nội dung dạng text.
     */
    private String serializeCvToText(OnlineCV cv) {
        StringBuilder sb = new StringBuilder();

        // Thông tin cá nhân
        if (cv.getPersonalInfo() != null) {
            var pi = cv.getPersonalInfo();
            sb.append("Họ tên: ").append(pi.getFullName()).append("\n");
            if (pi.getHeadline() != null)
                sb.append("Headline: ").append(pi.getHeadline()).append("\n");
            sb.append("\n");
        }

        // Từng section — chỉ lấy section visible, sắp xếp theo displayOrder
        if (cv.getSections() != null) {
            cv.getSections().stream()
                    .filter(CVSection::isVisible)
                    .sorted(java.util.Comparator.comparingInt(CVSection::getDisplayOrder))
                    .forEach(section -> {
                        sb.append("=== ").append(section.getType()).append(" ===\n");
                        if (section.getTitle() != null)
                            sb.append(section.getTitle()).append("\n");
                        if (section.getContent() != null)
                            sb.append(section.getContent()).append("\n");
                        sb.append("\n");
                    });
        }

        return sb.toString().trim();
    }

    private String parseSection(String fullText, String prefix) {
        if (fullText == null)
            return "";
        int start = fullText.indexOf(prefix);
        if (start < 0)
            return "";
        start += prefix.length();
        int end = fullText.indexOf("\n\n", start);
        return end > 0
                ? fullText.substring(start, end).trim()
                : fullText.substring(start).trim();
    }

    /**
     * @param cvId        CV cần tối ưu
     * @param jobPostId   JD để đối chiếu
     * @param candidateId người dùng hiện tại (để verify ownership + check quota)
     */
    public record Command(UUID cvId, UUID jobPostId, UUID candidateId) {
    }
}