package edu.tlu.jobplatform.ai.infrastructure.openai;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.ai.domain.model.JdOptimizationRequest;
import edu.tlu.jobplatform.ai.domain.model.JdOptimizationResult;
import edu.tlu.jobplatform.ai.domain.port.JdOptimizationPort;
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
public class OpenAIJdOptimizationAdapter implements JdOptimizationPort {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    @Value("classpath:prompts/jd-optimizer.st")
    private Resource promptTemplate;

    public OpenAIJdOptimizationAdapter(
            @Qualifier("jsonChatClient") ChatClient chatClient,
            ObjectMapper objectMapper) {
        this.chatClient = chatClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public JdOptimizationResult optimize(JdOptimizationRequest request) {
        log.info("JD optimization: title='{}'", request.getOriginalTitle());
        try {
            // ✅ Đọc file và replace thủ công — không dùng PromptTemplate
            String prompt = promptTemplate
                    .getContentAsString(StandardCharsets.UTF_8)
                    .replace("$title$", nullSafe(request.getOriginalTitle()))
                    .replace("$level$", nullSafe(request.getLevel()))
                    .replace("$category$", nullSafe(request.getCategory()))
                    .replace("$description$", nullSafe(request.getOriginalDescription()))
                    .replace("$requirements$", nullSafe(request.getOriginalRequirements()));

            String raw = chatClient.prompt().user(prompt).call().content();
            String clean = raw.trim()
                    .replaceAll("(?s)^```json\\s*", "")
                    .replaceAll("(?s)```\\s*$", "")
                    .trim();

            return objectMapper.readValue(clean, JdOptimizationResult.class);

        } catch (Exception e) {
            log.error("JD optimization failed: {}", e.getMessage());
            return JdOptimizationResult.builder()
                    .improvedTitle(request.getOriginalTitle())
                    .improvedDescription(request.getOriginalDescription())
                    .improvedRequirements(request.getOriginalRequirements())
                    .suggestions(List.of("Không thể tối ưu tự động. Vui lòng chỉnh sửa thủ công."))
                    .qualityScore(50)
                    .build();
        }
    }

    private String nullSafe(String s) {
        return s != null ? s : "";
    }
}