package edu.tlu.jobplatform.ai.infrastructure.persistence.adapter;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.ai.domain.model.JdGuidelineCheckRequest;
import edu.tlu.jobplatform.ai.domain.model.JdGuidelineCheckResult;
import edu.tlu.jobplatform.ai.domain.port.JdGuidelineCheckPort;
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
public class OpenAIJdGuidelineAdapter implements JdGuidelineCheckPort {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    @Value("classpath:prompts/jd-guideline.st")
    private Resource promptTemplate;

    public OpenAIJdGuidelineAdapter(
            @Qualifier("jsonChatClient") ChatClient chatClient,
            ObjectMapper objectMapper) {
        this.chatClient = chatClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public JdGuidelineCheckResult check(JdGuidelineCheckRequest req) {
        log.info("JD guideline check: jobPostId={}", req.getJobPostId());
        try {
            String prompt = promptTemplate
                    .getContentAsString(StandardCharsets.UTF_8)
                    .replace("$title$", nullSafe(req.getTitle()))
                    .replace("$description$", nullSafe(req.getDescription()))
                    .replace("$requirements$", nullSafe(req.getRequirements()))
                    .replace("$benefits$", nullSafe(req.getBenefits()));

            String raw = chatClient.prompt().user(prompt).call().content();
            String clean = raw.trim()
                    .replaceAll("(?s)^```json\\s*", "")
                    .replaceAll("(?s)```\\s*$", "")
                    .trim();

            return objectMapper.readValue(clean, JdGuidelineCheckResult.class);

        } catch (Exception e) {
            log.error("JD guideline check failed: {}", e.getMessage());
            return JdGuidelineCheckResult.builder()
                    .passed(false)
                    .severity(JdGuidelineCheckResult.Severity.WARNING)
                    .violations(List.of())
                    .overallFeedback("Không thể kiểm tra tự động. Vui lòng xem xét thủ công.")
                    .qualityScore(50)
                    .build();
        }
    }

    private String nullSafe(String s) {
        return s != null ? s : "";
    }
}