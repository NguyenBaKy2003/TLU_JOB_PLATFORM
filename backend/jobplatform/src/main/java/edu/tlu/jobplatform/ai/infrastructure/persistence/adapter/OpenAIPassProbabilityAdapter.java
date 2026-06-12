package edu.tlu.jobplatform.ai.infrastructure.persistence.adapter;

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

        if (req.getCvText() == null || req.getCvText().isBlank()) {
            return PassProbabilityResult.builder()
                    .probability(0.05)
                    .confidenceLevel(PassProbabilityResult.ConfidenceLevel.LOW)
                    .matchScore(0)
                    .strongPoints(List.of())
                    .weakPoints(List.of("Chưa có CV — không thể phân tích"))
                    .improvementTips(List.of())
                    .summary("Vui lòng upload CV để được phân tích chính xác.")
                    .build();
        }

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
                    .probability(0.05)
                    .confidenceLevel(PassProbabilityResult.ConfidenceLevel.LOW)
                    .matchScore(0)
                    .strongPoints(List.of())
                    .weakPoints(List.of())
                    .improvementTips(List.of())
                    .summary("Không thể phân tích tự động.")
                    .build();
        }
    }

    private double blendWithPoolStats(int matchScore, int applicants,
            int quota, int profileCompleteness) {
        double contentProb = matchScore / 100.0;

        double poolProb = quota > 0 && applicants > 0
                ? Math.min(1.0, (double) quota / applicants)
                : 0.2;

        double profileFactor = 0.8 + (profileCompleteness / 100.0) * 0.4;

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