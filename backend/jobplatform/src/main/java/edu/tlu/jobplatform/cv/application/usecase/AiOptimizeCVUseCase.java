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
 * Chỉ dành cho gói PREMIUM (aiCvWriter = true).
 *
 * Flow:
 * 1. Check feature flag aiCvWriter
 * 2. Load CV + verify ownership
 * 3. Load JobPost lấy JD
 * 4. Serialize CV → plain text
 * 5. Gọi AiCvOptimizePort → CvOptimizationResult
 * 6. Trả về gợi ý — KHÔNG tự sửa CV
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

        // 4. Parse JD — cùng format với AIScorePort
        String jobFullText = job.toFullText();
        String jobTitle = parseSection(jobFullText, "Vị trí: ");
        String jobDesc = parseSection(jobFullText, "Mô tả: ");
        String jobReqs = parseSection(jobFullText, "Yêu cầu: ");
        String jobBenefits = parseSection(jobFullText, "Quyền lợi: ");

        // 5. Build request domain model
        CvOptimizationRequest request = CvOptimizationRequest.builder()
                .cvId(cmd.cvId())
                .cvText(serializeCvToText(cv))
                .jobTitle(jobTitle)
                .jobDescription(jobDesc)
                .jobRequirements(jobReqs)
                .jobBenefits(jobBenefits)
                .outputLanguage("vi")
                .build();

        log.info("[AiOptimizeCV] Calling AI: cvId={} jobPostId={}", cmd.cvId(), cmd.jobPostId());

        // 6. Gọi port
        return aiCvOptimizePort.optimize(request);
    }

    // ── Helpers ──────

    private String serializeCvToText(OnlineCV cv) {
        StringBuilder sb = new StringBuilder();

        if (cv.getPersonalInfo() != null) {
            var pi = cv.getPersonalInfo();
            sb.append("Họ tên: ").append(pi.getFullName()).append("\n");
            if (pi.getHeadline() != null)
                sb.append("Headline: ").append(pi.getHeadline()).append("\n");
            sb.append("\n");
        }

        if (cv.getSections() != null) {
            cv.getSections().stream()
                    .filter(CVSection::isVisible)
                    .sorted(java.util.Comparator.comparingInt(CVSection::getDisplayOrder))
                    .forEach(s -> {
                        sb.append("=== ").append(s.getType()).append(" ===\n");
                        if (s.getTitle() != null)
                            sb.append(s.getTitle()).append("\n");
                        if (s.getContent() != null)
                            sb.append(s.getContent()).append("\n");
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

    public record Command(UUID cvId, UUID jobPostId, UUID candidateId) {
    }
}