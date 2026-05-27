package edu.tlu.jobplatform.job.application.usecase.employer;

import edu.tlu.jobplatform.ai.application.usecase.CheckJdGuidelinesUseCase;
import edu.tlu.jobplatform.ai.domain.model.JdGuidelineCheckResult;
import edu.tlu.jobplatform.ai.domain.model.JdGuidelineCheckResult.Violation;
import edu.tlu.jobplatform.job.application.port.out.QuotaServicePort;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.job.domain.service.JobPostDomainService;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubmitForReviewUseCase {

    private final JobPostRepository jobPostRepository;
    private final CheckJdGuidelinesUseCase checkJdGuidelinesUseCase;
    private final JobPostDomainService domainService; // thêm
    private final QuotaServicePort quotaService; // thêm

    public record Command(UUID jobPostId, boolean featured) {
    }

    public record Result(JobPost jobPost, JdGuidelineCheckResult checkResult) {
    }

    @Transactional
    public Result execute(Command cmd) {
        JobPost job = jobPostRepository.findById(cmd.jobPostId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy bài đăng: " + cmd.jobPostId()));

        // 1. Ownership check
        if (!SecurityUtils.isOwnerOrAdmin(job.getPostedBy()))
            throw new BusinessRuleException(
                    "Bạn không có quyền nộp bài đăng này.", "FORBIDDEN");

        // 2. Validate nội dung JD
        domainService.validateForPublish(job);

        // 3. Trừ quota đăng tin thường — throw nếu hết (rollback toàn bộ)
        quotaService.consumeQuota(job.getCompanyId());

        // 4. Trừ quota featured nếu cần — throw nếu hết (rollback kể cả bước 3)
        if (cmd.featured()) {
            quotaService.consumeFeaturedQuota(job.getCompanyId());
        }

        // 5. Chuyển sang PENDING_REVIEW
        job.submitForReview();
        jobPostRepository.save(job);

        // 6. Gọi AI kiểm tra
        JdGuidelineCheckResult checkResult = checkJdGuidelinesUseCase.execute(
                new CheckJdGuidelinesUseCase.Command(
                        job.getId(),
                        job.getTitle(),
                        job.getDescription(),
                        job.getRequirements(),
                        job.getBenefits()));

        // 7. Quyết định theo severity
        if (checkResult.hasBlockingIssues()) {
            String reason = buildRejectionReason(checkResult);
            job.reject(reason);
            // Hoàn quota nếu AI từ chối — tuỳ business rule
            quotaService.refundQuota(job.getCompanyId());
            if (cmd.featured())
                quotaService.refundFeaturedQuota(job.getCompanyId());
            log.info("Job {} rejected by AI. Severity={} Score={}",
                    job.getId(), checkResult.getSeverity(), checkResult.getQualityScore());
        } else {
            job.approve(cmd.featured());
            log.info("Job {} approved by AI. Severity={} Score={}",
                    job.getId(), checkResult.getSeverity(), checkResult.getQualityScore());
        }

        JobPost saved = jobPostRepository.save(job);
        return new Result(saved, checkResult);
    }

    /**
     * Xây chuỗi lý do từ chối từ danh sách violations.
     * Mỗi violation gồm: type + excerpt + explanation + suggestion.
     */
    private String buildRejectionReason(JdGuidelineCheckResult result) {
        List<Violation> violations = result.getViolations();

        if (violations == null || violations.isEmpty()) {
            // hasBlockingIssues() = true nhưng không có chi tiết → fallback
            return String.format(
                    "Bài đăng không đáp ứng tiêu chuẩn nội dung (mức độ: %s, điểm: %d/100). "
                            + "Vui lòng chỉnh sửa và nộp lại.",
                    result.getSeverity(), result.getQualityScore());
        }

        StringBuilder sb = new StringBuilder();
        sb.append(String.format(
                "Bài đăng bị từ chối (mức độ: %s, điểm chất lượng: %d/100).\n\n",
                result.getSeverity(), result.getQualityScore()));

        for (int i = 0; i < violations.size(); i++) {
            Violation v = violations.get(i);
            sb.append(String.format("%d. [%s]%n", i + 1, v.getType().name()));

            if (v.getExcerpt() != null && !v.getExcerpt().isBlank()) {
                sb.append("   Nội dung vi phạm: \"").append(v.getExcerpt()).append("\"\n");
            }
            if (v.getExplanation() != null && !v.getExplanation().isBlank()) {
                sb.append("   Lý do: ").append(v.getExplanation()).append("\n");
            }
            if (v.getSuggestion() != null && !v.getSuggestion().isBlank()) {
                sb.append("   Gợi ý sửa: ").append(v.getSuggestion()).append("\n");
            }
            sb.append("\n");
        }

        if (result.getOverallFeedback() != null && !result.getOverallFeedback().isBlank()) {
            sb.append("Nhận xét tổng thể: ").append(result.getOverallFeedback());
        }

        return sb.toString().trim();
    }
}