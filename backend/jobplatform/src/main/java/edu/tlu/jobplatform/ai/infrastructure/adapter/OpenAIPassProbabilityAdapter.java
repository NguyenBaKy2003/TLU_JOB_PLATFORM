package edu.tlu.jobplatform.ai.infrastructure.adapter;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.ai.domain.model.PassProbabilityRequest;
import edu.tlu.jobplatform.ai.domain.model.PassProbabilityResult;
import edu.tlu.jobplatform.ai.domain.port.PassProbabilityPort;
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
public class OpenAIPassProbabilityAdapter implements PassProbabilityPort {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    @Value("classpath:prompts/pass-probability.st")
    private Resource promptTemplate;

    public OpenAIPassProbabilityAdapter(
            @Qualifier("jsonChatClient") ChatClient chatClient,
            ObjectMapper objectMapper) {
        this.chatClient = chatClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public PassProbabilityResult calculate(PassProbabilityRequest req) {
        log.info("Pass probability: candidateId={} jobPostId={}",
                req.getCandidateId(), req.getJobPostId());
        try {
            String prompt = promptTemplate
                    .getContentAsString(StandardCharsets.UTF_8)
                    .replace("$jobTitle$", nullSafe(req.getJobTitle()))
                    .replace("$jobLevel$", nullSafe(req.getJobLevel()))
                    .replace("$jobDescription$", truncate(nullSafe(req.getJobDescription()), 1500))
                    .replace("$jobRequirements$", truncate(nullSafe(req.getJobRequirements()), 1500))
                    .replace("$cvText$", truncate(nullSafe(req.getCvText()), 4000))
                    .replace("$applicants$", String.valueOf(req.getCurrentApplicantCount()))
                    .replace("$quota$", String.valueOf(req.getHiringQuota()))
                    .replace("$profileScore$", String.valueOf(req.getProfileCompleteness()));

            String raw = chatClient.prompt().user(prompt).call().content();
            String clean = raw.trim()
                    .replaceAll("(?s)^```json\\s*", "")
                    .replaceAll("(?s)```\\s*$", "").trim();

            PassProbabilityResult aiResult = objectMapper.readValue(clean, PassProbabilityResult.class);

            // Blend AI match score với pool stats để ra probability cuối
            double blended = blendWithPoolStats(
                    aiResult.getMatchScore(),
                    req.getCurrentApplicantCount(),
                    req.getHiringQuota(),
                    req.getProfileCompleteness());

            return PassProbabilityResult.builder()
                    .probability(blended)
                    .confidenceLevel(aiResult.getConfidenceLevel())
                    .matchScore(aiResult.getMatchScore())
                    .strongPoints(aiResult.getStrongPoints())
                    .weakPoints(aiResult.getWeakPoints())
                    .improvementTips(aiResult.getImprovementTips())
                    .summary(aiResult.getSummary())
                    .build();

        } catch (Exception e) {
            log.error("Pass probability failed: {}", e.getMessage());
            return PassProbabilityResult.builder()
                    .probability(0.5)
                    .confidenceLevel(PassProbabilityResult.ConfidenceLevel.LOW)
                    .matchScore(50)
                    .strongPoints(List.of())
                    .weakPoints(List.of())
                    .improvementTips(List.of())
                    .summary("Không thể phân tích tự động.")
                    .build();
        }
    }

    /**
     * Blend AI content score với pool competition để ra xác suất thực tế.
     * Ví dụ: AI score 85/100 nhưng có 50 người apply 1 vị trí → prob thực tế thấp
     * hơn.
     */
    private double blendWithPoolStats(int matchScore, int applicants,
            int quota, int profileCompleteness) {
        // Xác suất thuần từ AI content (0.0-1.0)
        double contentProb = matchScore / 100.0;

        // Xác suất thuần từ pool stats (giả định phân phối đều)
        double poolProb = quota > 0 && applicants > 0
                ? Math.min(1.0, (double) quota / applicants)
                : 0.5;

        // Profile completeness bonus/penalty
        double profileFactor = 0.8 + (profileCompleteness / 100.0) * 0.4; // 0.8-1.2x

        // Weighted blend: AI content 60%, pool stats 40%
        double blended = (contentProb * 0.6 + poolProb * 0.4) * profileFactor;
        return Math.min(0.97, Math.max(0.02, blended));
    }

    private String truncate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max) + "...[truncated]";
    }

    private String nullSafe(String s) {
        return s != null ? s : "";
    }
}