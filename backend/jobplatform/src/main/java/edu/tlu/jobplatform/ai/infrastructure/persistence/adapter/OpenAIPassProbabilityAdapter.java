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

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Component
@Profile("!test")
public class OpenAIPassProbabilityAdapter implements PassProbabilityPort {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;
    private final String systemTemplate;
    private final String userTemplate;

    public OpenAIPassProbabilityAdapter(
            @Qualifier("jsonChatClient") ChatClient chatClient,
            ObjectMapper objectMapper,
            @Value("classpath:prompts/pass-probability-system.st") Resource systemResource,
            @Value("classpath:prompts/pass-probability-user.st") Resource userResource)
            throws IOException {
        this.chatClient = chatClient;
        this.objectMapper = objectMapper;
        this.systemTemplate = systemResource.getContentAsString(StandardCharsets.UTF_8);
        this.userTemplate = userResource.getContentAsString(StandardCharsets.UTF_8);
    }

    @Override
    public PassProbabilityResult calculate(PassProbabilityRequest req) {
        log.info("Pass probability: candidateId={} jobPostId={}",
                req.getCandidateId(), req.getJobPostId());

        if (req.getCvText() == null || req.getCvText().isBlank()) {
            return noCvResult();
        }

        try {
            String system = buildSystem(req);
            String user = buildUser(req.getCvText());

            String raw = chatClient.prompt()
                    .system(system)
                    .user(user)
                    .call()
                    .content();

            String clean = raw.trim()
                    .replaceAll("(?s)^```json\\s*", "")
                    .replaceAll("(?s)```\\s*$", "")
                    .trim();

            PassProbabilityResult aiResult = objectMapper.readValue(clean, PassProbabilityResult.class);

            double blended = blendWithPoolStats(
                    aiResult.getMatchScore(),
                    req.getCurrentApplicantCount(),
                    req.getHiringQuota(),
                    req.getProfileCompleteness(),
                    req.getHistoricalApplyCount(),
                    req.getHistoricalPassCount());

            return PassProbabilityResult.builder()
                    .probability(blended)
                    .confidenceLevel(aiResult.getConfidenceLevel())
                    .matchScore(aiResult.getMatchScore())
                    .strongPoints(nullSafeList(aiResult.getStrongPoints()))
                    .weakPoints(nullSafeList(aiResult.getWeakPoints()))
                    .improvementTips(nullSafeList(aiResult.getImprovementTips()))
                    .summary(aiResult.getSummary())
                    .build();

        } catch (Exception e) {
            log.error("Pass probability failed: candidateId={} error={}",
                    req.getCandidateId(), e.getMessage());
            return fallbackResult();
        }
    }

    // ── Prompt builders ───────────────────────────────────────────────────────

    private String buildSystem(PassProbabilityRequest req) {
        return systemTemplate
                .replace("$jobTitle$", nullSafe(req.getJobTitle()))
                .replace("$jobLevel$", nullSafe(req.getJobLevel()))
                .replace("$jobDescription$", truncate(nullSafe(req.getJobDescription()), 1500))
                .replace("$jobRequirements$", truncate(nullSafe(req.getJobRequirements()), 1500))
                .replace("$applicants$", String.valueOf(req.getCurrentApplicantCount()))
                .replace("$quota$", String.valueOf(req.getHiringQuota()))
                .replace("$historicalApplyCount$", String.valueOf(req.getHistoricalApplyCount()))
                .replace("$historicalPassCount$", String.valueOf(req.getHistoricalPassCount()))
                .replace("$profileScore$", String.valueOf(req.getProfileCompleteness()));
    }

    private String buildUser(String cvText) {
        return userTemplate.replace("$cvText$", truncate(cvText, 4000));
    }

    // ── Probability blending ──────────────────────────────────────────────────

    /**
     * Blend xác suất từ 3 nguồn:
     *
     * 1. contentProb (60%) — matchScore từ AI: CV có phù hợp với JD không
     * 2. poolProb (30%) — tỉ lệ quota/applicants: cơ hội từ pool cạnh tranh
     * 3. historicalProb (10%) — lịch sử candidate: tỉ lệ pass phỏng vấn trước đây
     *
     * profileFactor: nhân thêm hệ số dựa trên độ hoàn thiện hồ sơ (0.8 → 1.2)
     */
    private double blendWithPoolStats(int matchScore, int applicants, int quota,
            int profileCompleteness, int historicalApply, int historicalPass) {

        double contentProb = matchScore / 100.0;

        double poolProb = (quota > 0 && applicants > 0)
                ? Math.min(1.0, (double) quota / applicants)
                : 0.2; // default nếu chưa có ứng viên

        // Lịch sử candidate: tỉ lệ pass/apply, default 0.3 nếu chưa có lịch sử
        double historicalProb = (historicalApply > 0)
                ? Math.min(1.0, (double) historicalPass / historicalApply)
                : 0.3;

        double profileFactor = 0.8 + (profileCompleteness / 100.0) * 0.4; // 0.8 → 1.2

        double blended = (contentProb * 0.60 + poolProb * 0.30 + historicalProb * 0.10)
                * profileFactor;

        return Math.min(0.97, Math.max(0.02, blended));
    }

    // ── Result factories ──────────────────────────────────────────────────────

    private PassProbabilityResult noCvResult() {
        return PassProbabilityResult.builder()
                .probability(0.05)
                .confidenceLevel(PassProbabilityResult.ConfidenceLevel.LOW)
                .matchScore(0)
                .strongPoints(List.of())
                .weakPoints(List.of("Chưa có CV — không thể phân tích"))
                .improvementTips(List.of())
                .summary("Vui lòng upload CV hoặc tạo CV online để được phân tích chính xác.")
                .build();
    }

    private PassProbabilityResult fallbackResult() {
        return PassProbabilityResult.builder()
                .probability(0.05)
                .confidenceLevel(PassProbabilityResult.ConfidenceLevel.LOW)
                .matchScore(0)
                .strongPoints(List.of())
                .weakPoints(List.of())
                .improvementTips(List.of())
                .summary("Không thể phân tích tự động. Vui lòng thử lại sau.")
                .build();
    }

    // ── Utilities ─────────────────────────────────────────────────────────────

    private String truncate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max) + "...[truncated]";
    }

    private String nullSafe(String s) {
        return s != null ? s : "";
    }

    private <T> List<T> nullSafeList(List<T> list) {
        return list != null ? list : List.of();
    }
}