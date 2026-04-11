package edu.tlu.jobplatform.ai.infrastructure.openai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.ai.domain.model.CvAnalysisRequest;
import edu.tlu.jobplatform.ai.domain.model.CvAnalysisResult;
import edu.tlu.jobplatform.ai.domain.port.CvAnalysisPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Primary
@Component
@Profile("!test")
public class OpenAICvAnalysisAdapter implements CvAnalysisPort {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    @Value("classpath:prompts/cv-scoring.st")
    private Resource promptTemplate;

    // ✅ Inject jsonChatClient (temperature thấp, JSON mode)
    public OpenAICvAnalysisAdapter(
            @Qualifier("jsonChatClient") ChatClient chatClient,
            ObjectMapper objectMapper) {
        this.chatClient = chatClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public CvAnalysisResult analyze(CvAnalysisRequest request) {
        log.info("CV analysis: applicationId={} jobTitle='{}'",
                request.getApplicationId(), request.getJobTitle());
        try {
            // ✅ Đọc file .st và replace thủ công — không dùng PromptTemplate
            String prompt = promptTemplate
                    .getContentAsString(StandardCharsets.UTF_8)
                    .replace("$jobTitle$", nullSafe(request.getJobTitle()))
                    .replace("$jobLevel$", nullSafe(request.getJobLevel()))
                    .replace("$jobDescription$", nullSafe(request.getJobDescription()))
                    .replace("$jobRequirements$", nullSafe(request.getJobRequirements()))
                    .replace("$cvText$", truncate(nullSafe(request.getCvText()), 6000));

            String raw = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            return parseResponse(raw);

        } catch (Exception e) {
            log.error("CV analysis failed applicationId={}: {}",
                    request.getApplicationId(), e.getMessage());
            return fallbackResult();
        }
    }

    private CvAnalysisResult parseResponse(String raw) throws JsonProcessingException {
        String clean = raw.trim()
                .replaceAll("(?s)^```json\\s*", "")
                .replaceAll("(?s)```\\s*$", "")
                .trim();
        return objectMapper.readValue(clean, CvAnalysisResult.class);
    }

    private CvAnalysisResult fallbackResult() {
        return CvAnalysisResult.builder()
                .overallScore(0).skillMatchScore(0)
                .experienceScore(0).educationScore(0)
                .strengths(List.of())
                .gaps(List.of("Không thể phân tích tự động"))
                .summary("Vui lòng xem xét CV thủ công.")
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