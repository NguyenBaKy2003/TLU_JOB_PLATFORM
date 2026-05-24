package edu.tlu.jobplatform.ai.infrastructure.openai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.ai.domain.model.CvOptimizationRequest;
import edu.tlu.jobplatform.ai.domain.model.CvOptimizationResult;
import edu.tlu.jobplatform.ai.domain.port.CvOptimizationPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Component
@Profile("!test")
public class OpenAiCvOptimizeAdapter implements CvOptimizationPort {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    @Value("classpath:prompts/cv-optimizer.st")
    private Resource promptTemplate;

    // Inject jsonChatClient (temperature thấp, JSON mode) — giống
    // OpenAICvAnalysisAdapter
    public OpenAiCvOptimizeAdapter(
            @Qualifier("jsonChatClient") ChatClient chatClient,
            ObjectMapper objectMapper) {
        this.chatClient = chatClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public CvOptimizationResult optimize(CvOptimizationRequest request) {
        log.info("[CvOptimize] Starting: cvId={} jobTitle='{}'",
                request.getCvId(), request.getJobTitle());
        try {
            String prompt = promptTemplate
                    .getContentAsString(StandardCharsets.UTF_8)
                    .replace("$outputLanguage$", nullSafe(request.getOutputLanguage()))
                    .replace("$cvText$", truncate(nullSafe(request.getCvText()), 6000))
                    .replace("$jobTitle$", nullSafe(request.getJobTitle()))
                    .replace("$jobDescription$", nullSafe(request.getJobDescription()))
                    .replace("$jobRequirements$", nullSafe(request.getJobRequirements()))
                    .replace("$jobBenefits$", nullSafe(request.getJobBenefits()));

            String raw = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            CvOptimizationResult result = parseResponse(raw);

            log.info("[CvOptimize] Done: cvId={} matchScore={} missingKeywords={}",
                    request.getCvId(), result.getMatchScore(),
                    result.getMissingKeywords() != null ? result.getMissingKeywords().size() : 0);

            return result;

        } catch (Exception e) {
            log.error("[CvOptimize] Failed: cvId={} error={}", request.getCvId(), e.getMessage());
            return fallbackResult();
        }
    }

    private CvOptimizationResult parseResponse(String raw) throws JsonProcessingException {
        String clean = raw.trim()
                .replaceAll("(?s)^```json\\s*", "")
                .replaceAll("(?s)```\\s*$", "")
                .trim();
        return objectMapper.readValue(clean, CvOptimizationResult.class);
    }

    private CvOptimizationResult fallbackResult() {
        return CvOptimizationResult.builder()
                .overallSummary("Không thể phân tích CV lúc này. Vui lòng thử lại.")
                .suggestedSummary(null)
                .skillsToAdd(List.of())
                .skillsToRemove(List.of())
                .experienceSuggestions(List.of())
                .missingKeywords(List.of())
                .matchScore(null)
                .build();
    }

    private String truncate(String text, int maxChars) {
        return text.length() <= maxChars ? text
                : text.substring(0, maxChars) + "\n...[truncated]";
    }

    private String nullSafe(String s) {
        return s != null ? s : "";
    }
}