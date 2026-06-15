package edu.tlu.jobplatform.ai.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.ai.domain.model.CvAnalysisRequest;
import edu.tlu.jobplatform.ai.domain.model.CvAnalysisResult;
import edu.tlu.jobplatform.ai.domain.port.CvAnalysisPort;
import edu.tlu.jobplatform.ai.infrastructure.openai.PdfTextExtractor;
import edu.tlu.jobplatform.application.domain.model.vo.AIScore;
import edu.tlu.jobplatform.application.usecase.port.out.AIScorePort;
import edu.tlu.jobplatform.cv.application.service.CVTextExtractor;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.UUID;

/**
 * AIScorePort implementation.
 *
 * Xử lý 2 loại CV:
 *
 * 1. UPLOADED CV — cvUrl là S3 URL (bắt đầu bằng "https://")
 * → PdfTextExtractor.extractFromUrl(cvUrl) như cũ
 *
 * 2. ONLINE CV — cvUrl là slug (ví dụ "cv-minimal-f15ea7")
 * → Ưu tiên dùng exportedPdfUrl nếu có (PDF đã render sẵn trên S3)
 * → Fallback: CVTextExtractor.extract(cv) — serialize entity thành text
 */
@Slf4j
@Primary
@Component
@Profile("!test")
@RequiredArgsConstructor
public class OpenAIScoreAdapter implements AIScorePort {

    private final CvAnalysisPort cvAnalysisPort;
    private final PdfTextExtractor pdfExtractor;
    private final OnlineCVRepository onlineCVRepository;
    private final CVTextExtractor cvTextExtractor;

    @Override
    public AIScore calculateScore(UUID applicationId, String cvUrl, String jobFullText) {
        log.info("AI scoring: applicationId={}", applicationId);

        String cvText = resolveCvText(applicationId, cvUrl);

        String title = parseSection(jobFullText, "Vị trí: ");
        String desc = parseSection(jobFullText, "Mô tả: ");
        String requires = parseSection(jobFullText, "Yêu cầu: ");

        CvAnalysisRequest request = CvAnalysisRequest.builder()
                .applicationId(applicationId)
                .cvText(cvText)
                .jobTitle(title)
                .jobDescription(desc)
                .jobRequirements(requires)
                .jobLevel(null)
                .build();

        CvAnalysisResult result = cvAnalysisPort.analyze(request);

        return AIScore.builder()
                .score(result.getOverallScore())
                .skillMatchScore(result.getSkillMatchScore())
                .experienceScore(result.getExperienceScore())
                .educationScore(result.getEducationScore())
                .strengths(result.getStrengths())
                .gaps(result.getGaps())
                .summary(result.getSummary())
                .modelVersion("gpt-4o-mini")
                .build();
    }

    // ── CV text resolution ────────────────────────────────────────────────────

    /**
     * Resolve cvUrl → plain text mà AI có thể đọc.
     *
     * Online CV slug (không bắt đầu bằng "http"):
     * 1. Lookup slug → OnlineCV
     * 2. Nếu có exportedPdfUrl → extract text từ PDF trên S3
     * 3. Fallback → serialize entity thành text
     *
     * Uploaded CV (S3 URL):
     * → Extract text từ PDF trực tiếp
     */
    private String resolveCvText(UUID applicationId, String cvUrl) {
        if (!StringUtils.hasText(cvUrl)) {
            log.warn("cvUrl is blank: applicationId={}", applicationId);
            return "";
        }

        if (isOnlineCvSlug(cvUrl)) {
            return resolveOnlineCvText(applicationId, cvUrl);
        }

        // Uploaded CV — flow cũ
        String text = pdfExtractor.extractFromUrl(cvUrl);
        if (!StringUtils.hasText(text)) {
            log.warn("CV text empty for applicationId={} cvUrl={}", applicationId, cvUrl);
        }
        return text;
    }

    private String resolveOnlineCvText(UUID applicationId, String slug) {
        log.info("Resolving Online CV by slug: applicationId={} slug={}", applicationId, slug);

        OnlineCV cv = onlineCVRepository.findBySlug(slug).orElse(null);
        if (cv == null) {
            log.warn("OnlineCV not found for slug={} applicationId={}", slug, applicationId);
            return "";
        }

        // Ưu tiên: extract từ PDF đã render sẵn
        String exportedPdfUrl = cv.getExportedPdfUrl();
        if (StringUtils.hasText(exportedPdfUrl)) {
            log.info("Extracting text from exported PDF: cvId={} pdfUrl={}", cv.getId(), exportedPdfUrl);
            String text = pdfExtractor.extractFromUrl(exportedPdfUrl);
            if (StringUtils.hasText(text)) {
                return text;
            }
            log.warn("PDF extraction returned empty, falling back to entity text: cvId={}", cv.getId());
        } else {
            log.info("No exportedPdfUrl found, using entity text extraction: cvId={}", cv.getId());
        }

        // Fallback: serialize entity trực tiếp
        return cvTextExtractor.extract(cv);
    }

    /**
     * Online CV slug không bắt đầu bằng "http" và không chứa "/".
     * Ví dụ: "cv-minimal-f15ea7", "test-f15ea7"
     */
    private boolean isOnlineCvSlug(String cvUrl) {
        return !cvUrl.startsWith("http") && !cvUrl.contains("/");
    }

    // ── Job text parsing ──────────────────────────────────────────────────────

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
}