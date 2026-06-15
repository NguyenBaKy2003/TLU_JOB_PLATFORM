package edu.tlu.jobplatform.ai.application.usecase;

import edu.tlu.jobplatform.ai.domain.model.PassProbabilityRequest;
import edu.tlu.jobplatform.ai.domain.model.PassProbabilityResult;
import edu.tlu.jobplatform.ai.domain.port.PassProbabilityPort;
import edu.tlu.jobplatform.ai.infrastructure.openai.PdfTextExtractor;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateCVRepository;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.cv.application.service.CVTextExtractor;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CalculatePassProbabilityUseCase {

    private final CandidateProfileRepository candidateRepo;
    private final JobPostRepository jobPostRepo;
    private final ApplicationRepository applicationRepo;
    private final PdfTextExtractor pdfExtractor;
    private final PassProbabilityPort probabilityPort;
    private final CandidateCVRepository cvRepo;
    private final OnlineCVRepository onlineCVRepo;
    private final CVTextExtractor cvTextExtractor;

    @Cacheable(value = "passProbability", key = "#cmd.candidateId + ':' + #cmd.jobPostId")
    public PassProbabilityResult execute(Command cmd) {
        JobPost job = jobPostRepo.findById(cmd.jobPostId())
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", cmd.jobPostId()));

        CandidateProfile candidate = candidateRepo.findByUserId(cmd.candidateId())
                .orElseThrow(() -> ResourceNotFoundException.of("Candidate", cmd.candidateId()));

        String cvText = extractCvText(cmd.candidateId());
        int completeness = calculateProfileCompleteness(candidate);

        if ((cvText == null || cvText.isBlank()) && completeness < 20) {
            log.info("Skip AI call: no CV and incomplete profile. candidateId={}", cmd.candidateId());
            return PassProbabilityResult.builder()
                    .probability(0.05)
                    .confidenceLevel(PassProbabilityResult.ConfidenceLevel.LOW)
                    .matchScore(0)
                    .strongPoints(List.of())
                    .weakPoints(List.of("Chưa có CV", "Hồ sơ chưa đủ thông tin"))
                    .improvementTips(List.of())
                    .summary("Vui lòng upload CV và hoàn thiện hồ sơ để được phân tích chính xác.")
                    .build();
        }

        ApplicationRepository.ApplicationStats stats = applicationRepo.getStats(cmd.candidateId(), cmd.jobPostId());

        PassProbabilityRequest request = PassProbabilityRequest.builder()
                .candidateId(cmd.candidateId())
                .jobPostId(cmd.jobPostId())
                .cvText(cvText)
                .jobTitle(job.getTitle())
                .jobDescription(job.getDescription())
                .jobRequirements(job.getRequirements())
                .jobLevel(job.getLevel())
                .currentApplicantCount(stats.currentApplicantCount())
                .hiringQuota(job.getVacancies() != null ? job.getVacancies() : 0)
                .historicalApplyCount(stats.totalApply())
                .historicalPassCount(stats.totalPass())
                .profileCompleteness(completeness)
                .build();

        return probabilityPort.calculate(request);
    }

    // ── CV text extraction ────────────────────────────────────────────────────

    /**
     * Priority:
     * 1. Uploaded CV primary → extract text từ PDF trên S3
     * 2. Online CV published → dùng exportedPdfUrl nếu có (PDF đã render)
     * 3. Online CV published → fallback serialize entity thành text
     * 4. Không có CV → trả về ""
     */
    private String extractCvText(UUID candidateId) {
        // 1. Uploaded CV (primary)
        String uploadedText = cvRepo.findPrimaryByCandidateId(candidateId)
                .map(CandidateCV::getFileUrl)
                .map(url -> {
                    try {
                        return pdfExtractor.extractFromUrl(url);
                    } catch (Exception e) {
                        log.warn("Failed to extract uploaded CV: url={} reason={}", url, e.getMessage());
                        return null;
                    }
                })
                .orElse(null);

        if (StringUtils.hasText(uploadedText)) {
            log.info("Using uploaded CV text: candidateId={} chars={}", candidateId, uploadedText.length());
            return uploadedText;
        }

        // 2 & 3. Online CV published
        return onlineCVRepo.findPublishedByCandidateId(candidateId)
                .stream()
                .findFirst()
                .map(cv -> extractOnlineCvText(candidateId, cv))
                .orElse("");
    }

    /**
     * Với Online CV:
     * - Ưu tiên exportedPdfUrl (PDF đã render sẵn → text chính xác nhất)
     * - Fallback về CVTextExtractor (serialize entity → text có cấu trúc)
     *
     * KHÔNG dùng section.getContent() thô vì đó là JSON string,
     * AI không đọc được hiệu quả.
     */
    private String extractOnlineCvText(UUID candidateId, OnlineCV cv) {
        String exportedPdfUrl = cv.getExportedPdfUrl();
        if (StringUtils.hasText(exportedPdfUrl)) {
            try {
                String text = pdfExtractor.extractFromUrl(exportedPdfUrl);
                if (StringUtils.hasText(text)) {
                    log.info("Using exported PDF for Online CV: candidateId={} cvId={} chars={}",
                            candidateId, cv.getId(), text.length());
                    return text;
                }
                log.warn("Exported PDF returned empty text, falling back to entity: cvId={}", cv.getId());
            } catch (Exception e) {
                log.warn("Failed to extract exported PDF: cvId={} reason={}", cv.getId(), e.getMessage());
            }
        } else {
            log.info("No exportedPdfUrl on Online CV, using entity extraction: cvId={}", cv.getId());
        }

        // Fallback: serialize entity thành plain text có cấu trúc
        String text = cvTextExtractor.extract(cv);
        log.info("Using entity text for Online CV: candidateId={} cvId={} chars={}",
                candidateId, cv.getId(), text.length());
        return text;
    }

    // ── Profile completeness ──────────────────────────────────────────────────

    private int calculateProfileCompleteness(CandidateProfile c) {
        int score = 0;
        if (c.getAvatarUrl() != null && !c.getAvatarUrl().isBlank())
            score += 10;
        if (c.getPhone() != null && c.getPhone().replaceAll("\\D", "").length() >= 8)
            score += 10;
        if (c.getSummary() != null && c.getSummary().length() > 50)
            score += 20;
        if (c.getSkills() != null && c.getSkills().size() >= 2)
            score += 20;
        if (c.getExperiences() != null && !c.getExperiences().isEmpty())
            score += 20;
        if (c.getEducations() != null && !c.getEducations().isEmpty())
            score += 20;
        return Math.min(score, 100);
    }

    public record Command(UUID candidateId, UUID jobPostId) {
    }
}