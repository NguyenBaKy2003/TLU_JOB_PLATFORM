package edu.tlu.jobplatform.ai.infrastructure.openai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.ai.domain.model.CvAnalysisRequest;
import edu.tlu.jobplatform.ai.domain.model.CvAnalysisResult;
import edu.tlu.jobplatform.ai.domain.port.CvAnalysisPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Gọi OpenAI GPT-4o-mini để phân tích CV vs JD.
 *
 * @Primary — override MockCvAnalysisAdapter khi không phải test profile.
 *          @Profile("!test") — không load khi chạy unit test.
 *
 *          Dùng Spring AI ChatClient để call OpenAI API.
 *          Prompt được load từ file resources/prompts/cv-scoring.st
 */
@Slf4j
@Primary
@Component
@Profile("!test")
@RequiredArgsConstructor
public class OpenAICvAnalysisAdapter implements CvAnalysisPort {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    @Value("classpath:prompts/cv-scoring.st")
    private Resource promptTemplate;

    @Override
    public CvAnalysisResult analyze(CvAnalysisRequest request) {
        log.info("AI scoring: applicationId={}", request.getApplicationId());

        try {
            // Build prompt từ template
            String prompt = new PromptTemplate(promptTemplate)
                    .render(Map.of(
                            "jobTitle", nullSafe(request.getJobTitle()),
                            "jobLevel", nullSafe(request.getJobLevel()),
                            "jobDescription", nullSafe(request.getJobDescription()),
                            "jobRequirements", nullSafe(request.getJobRequirements()),
                            "cvText", nullSafe(request.getCvText())));

            // Call OpenAI
            String response = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            // Parse JSON response
            return parseResponse(response);

        } catch (Exception e) {
            log.error("AI scoring failed for applicationId={}: {}",
                    request.getApplicationId(), e.getMessage());
            return fallbackResult();
        }
    }

    // ── Helpers ───────────────────────────────────────────────

    private CvAnalysisResult parseResponse(String json) throws JsonProcessingException {
        // Strip markdown code fences nếu có
        String clean = json.trim();
        if (clean.startsWith("```")) {
            clean = clean.replaceAll("(?s)```json\\s*|```\\s*", "").trim();
        }
        return objectMapper.readValue(clean, CvAnalysisResult.class);
    }

    /** Kết quả dự phòng khi AI lỗi — không block flow chính */
    private CvAnalysisResult fallbackResult() {
        return CvAnalysisResult.builder()
                .overallScore(0)
                .skillMatchScore(0)
                .experienceScore(0)
                .educationScore(0)
                .strengths(java.util.List.of())
                .gaps(java.util.List.of())
                .summary("Không thể phân tích CV tự động. Vui lòng xem xét thủ công.")
                .build();
    }

    private String nullSafe(String s) {
        return s != null ? s : "";
    }
}
