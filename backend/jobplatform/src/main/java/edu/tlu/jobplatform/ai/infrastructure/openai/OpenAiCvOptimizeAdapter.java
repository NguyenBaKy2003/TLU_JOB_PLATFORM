package edu.tlu.jobplatform.ai.infrastructure.openai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.ai.domain.model.CvOptimizationRequest;
import edu.tlu.jobplatform.ai.domain.model.CvOptimizationResult;
import edu.tlu.jobplatform.cv.application.port.out.AiCvOptimizePort;
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
public class OpenAiCvOptimizeAdapter implements AiCvOptimizePort {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    @Value("classpath:prompts/cv-optimizer.st")
    private Resource promptTemplate;

    public OpenAiCvOptimizeAdapter(
            @Qualifier("jsonChatClient") ChatClient chatClient,
            ObjectMapper objectMapper) {
        this.chatClient = chatClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public CvOptimizationResult optimize(CvOptimizationRequest request) {
        log.info("[AiCvOptimize] Start: cvId={} jobTitle='{}'",
                request.getCvId(), truncate(request.getJobTitle(), 50));

        try {
            String prompt = promptTemplate
                    .getContentAsString(StandardCharsets.UTF_8)
                    .replace("$cvText$", nullSafe(request.getCvText()))
                    .replace("$jobTitle$", nullSafe(request.getJobTitle()))
                    .replace("$jobDescription$", nullSafe(request.getJobDescription()))
                    .replace("$jobRequirements$", nullSafe(request.getJobRequirements()))
                    .replace("$jobBenefits$", nullSafe(request.getJobBenefits()))
                    .replace("$outputLanguage$", nullSafe(request.getOutputLanguage(), "vi"));

            String raw = chatClient.prompt().user(prompt).call().content();
            String clean = cleanJsonResponse(raw);

            JsonNode root = objectMapper.readTree(clean);

            fixFieldToString(root, "overallSummary");
            fixFieldToString(root, "suggestedSummary");

            CvOptimizationResult result = objectMapper.treeToValue(root, CvOptimizationResult.class);

            log.info("[AiCvOptimize] Done: cvId={} matchScore={} missingKeywords={}",
                    request.getCvId(),
                    result.getMatchScore(),
                    result.getMissingKeywords() != null ? result.getMissingKeywords().size() : 0);

            return result;

        } catch (Exception e) {
            log.error("[AiCvOptimize] Failed: cvId={} error={}",
                    request.getCvId(), e.getMessage());
            return buildFallbackResult();
        }
    }

    private String cleanJsonResponse(String raw) {
        if (raw == null || raw.isBlank())
            return "{}";
        String clean = raw.trim()
                .replaceAll("(?s)^```(?:json)?\\s*", "")
                .replaceAll("(?s)```\\s*$", "")
                .trim();
        int start = clean.indexOf('{');
        int end = clean.lastIndexOf('}');
        if (start >= 0 && end > start)
            clean = clean.substring(start, end + 1);
        return clean;
    }

    private void fixFieldToString(JsonNode root, String field) {
        JsonNode node = root.get(field);
        if (node == null || node.isNull()) {
            if (root instanceof com.fasterxml.jackson.databind.node.ObjectNode on)
                on.put(field, "");
            return;
        }
        if (node.isObject() || node.isArray()) {
            if (root instanceof com.fasterxml.jackson.databind.node.ObjectNode on)
                on.put(field, node.toString());
            log.debug("[AiCvOptimize] Fixed field '{}' from {} to String",
                    field, node.getNodeType());
        }
    }

    private CvOptimizationResult buildFallbackResult() {
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

    private String nullSafe(String s) {
        return s != null ? s : "";
    }

    private String nullSafe(String s, String defaultVal) {
        return (s != null && !s.isBlank()) ? s : defaultVal;
    }

    private String truncate(String s, int max) {
        if (s == null)
            return "null";
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }
}