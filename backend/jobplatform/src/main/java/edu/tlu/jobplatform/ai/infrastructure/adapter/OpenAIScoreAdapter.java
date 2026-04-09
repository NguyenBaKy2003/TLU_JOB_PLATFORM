package edu.tlu.jobplatform.ai.infrastructure.adapter;

import edu.tlu.jobplatform.ai.domain.model.CvAnalysisRequest;
import edu.tlu.jobplatform.ai.domain.model.CvAnalysisResult;
import edu.tlu.jobplatform.ai.domain.port.CvAnalysisPort;
import edu.tlu.jobplatform.ai.infrastructure.openai.PdfTextExtractor;
import edu.tlu.jobplatform.application.domain.model.vo.AIScore;
import edu.tlu.jobplatform.application.usecase.port.out.AIScorePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Sprint 5: Thay thế MockAIScoreAdapter.
 * Bridge: Application.AIScorePort → AI.CvAnalysisPort → OpenAI.
 */
@Slf4j
@Primary
@Component
@Profile("!test")
@RequiredArgsConstructor
public class OpenAIScoreAdapter implements AIScorePort {

    private final CvAnalysisPort cvAnalysisPort;
    private final PdfTextExtractor pdfExtractor;

    @Override
    public AIScore calculateScore(UUID applicationId, String cvUrl, String jobFullText) {
        log.info("AI scoring: applicationId={}", applicationId);

        // Extract text từ CV PDF
        String cvText = pdfExtractor.extractFromUrl(cvUrl);
        if (cvText.isBlank()) {
            log.warn("CV text empty for applicationId={}, using URL as fallback", applicationId);
            cvText = "CV URL: " + cvUrl;
        }

        // Parse jobFullText → các phần riêng biệt
        // Format từ JobPost.toFullText(): "Vị trí: X\n\nMô tả: Y\n\nYêu cầu: Z\n\nQuyền
        // lợi: W"
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

    private String parseSection(String fullText, String prefix) {
        if (fullText == null)
            return "";
        int start = fullText.indexOf(prefix);
        if (start < 0)
            return "";
        start += prefix.length();
        int end = fullText.indexOf("\n\n", start);
        return end > 0 ? fullText.substring(start, end).trim()
                : fullText.substring(start).trim();
    }
}
