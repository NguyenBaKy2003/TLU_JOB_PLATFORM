package edu.tlu.jobplatform.ai.infrastructure.adapter;

import com.fasterxml.jackson.databind.ObjectMapper;

import edu.tlu.jobplatform.ai.domain.model.CandidateComparisonRequest;
import edu.tlu.jobplatform.ai.domain.model.CandidateComparisonResult;
import edu.tlu.jobplatform.ai.domain.port.CandidateComparisonPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Component
@Profile("!test")
public class HybridCandidateComparisonAdapter implements CandidateComparisonPort {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    @Value("classpath:prompts/candidate-comparison.st")
    private Resource promptTemplate;

    public HybridCandidateComparisonAdapter(
            @Qualifier("jsonChatClient") ChatClient chatClient,
            ObjectMapper objectMapper) {
        this.chatClient = chatClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public CandidateComparisonResult compare(CandidateComparisonRequest req) {
        log.info("Candidate comparison: jobPostId={} count={}",
                req.getJobPostId(), req.getCandidates().size());

        // Nếu ≤ 3 ứng viên: gọi AI để có phân tích sâu
        // Nếu > 3 ứng viên: pre-sort bằng AI score, chỉ gửi top N cho AI
        List<CandidateComparisonRequest.CandidateProfile> toAnalyze = req.getCandidates().size() > 6
                ? req.getCandidates().stream()
                        .sorted(Comparator.comparingInt(
                                CandidateComparisonRequest.CandidateProfile::getAiScore).reversed())
                        .limit(6).toList()
                : req.getCandidates();

        try {
            // Tạo summary của từng candidate để gửi AI (không gửi full CV)
            String candidatesSummary = buildCandidatesSummary(toAnalyze);

            String prompt = promptTemplate
                    .getContentAsString(StandardCharsets.UTF_8)
                    .replace("$jobTitle$", nullSafe(req.getJobTitle()))
                    .replace("$jobLevel$", nullSafe(req.getJobLevel()))
                    .replace("$jobRequirements$", truncate(nullSafe(req.getJobRequirements()), 1000))
                    .replace("$candidates$", candidatesSummary);

            String raw = chatClient.prompt().user(prompt).call().content();
            String clean = raw.trim()
                    .replaceAll("(?s)^```json\\s*", "")
                    .replaceAll("(?s)```\\s*$", "").trim();

            return objectMapper.readValue(clean, CandidateComparisonResult.class);

        } catch (Exception e) {
            log.error("Candidate comparison failed: {}", e.getMessage());
            // Fallback: sort thuần bằng AI score, không có narrative
            return buildFallbackResult(req.getCandidates());
        }
    }

    private String buildCandidatesSummary(
            List<CandidateComparisonRequest.CandidateProfile> candidates) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < candidates.size(); i++) {
            var c = candidates.get(i);
            sb.append(String.format("""
                    Ứng viên %d: %s (applicationId: %s)
                    - Điểm tổng: %d | Kỹ năng: %d | Kinh nghiệm: %d | Học vấn: %d
                    - Điểm mạnh: %s
                    - Điểm yếu: %s
                    ---
                    """,
                    i + 1, c.getCandidateName(), c.getApplicationId(),
                    c.getAiScore(), c.getSkillMatchScore(),
                    c.getExperienceScore(), c.getEducationScore(),
                    String.join(", ", c.getStrengths()),
                    String.join(", ", c.getGaps())));
        }
        return sb.toString();
    }

    private CandidateComparisonResult buildFallbackResult(
            List<CandidateComparisonRequest.CandidateProfile> candidates) {
        var sorted = candidates.stream()
                .sorted(Comparator.comparingInt(
                        CandidateComparisonRequest.CandidateProfile::getAiScore).reversed())
                .toList();

        List<CandidateComparisonResult.RankedCandidate> ranking = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            var c = sorted.get(i);
            ranking.add(CandidateComparisonResult.RankedCandidate.builder()
                    .rank(i + 1)
                    .applicationId(c.getApplicationId())
                    .candidateName(c.getCandidateName())
                    .totalScore(c.getAiScore())
                    .skillScore(c.getSkillMatchScore())
                    .experienceScore(c.getExperienceScore())
                    .educationScore(c.getEducationScore())
                    .uniqueStrengths(c.getStrengths())
                    .relativeWeaknesses(c.getGaps())
                    .verdict("Xếp hạng theo điểm AI")
                    .build());
        }
        return CandidateComparisonResult.builder()
                .ranking(ranking)
                .topRecommendation(sorted.isEmpty() ? null : sorted.get(0).getApplicationId())
                .comparisonSummary("Không thể phân tích tự động, đã xếp hạng theo điểm AI.")
                .recruitmentAdvice("Xem xét thủ công để có đánh giá chính xác hơn.")
                .build();
    }

    private String truncate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max) + "...[truncated]";
    }

    private String nullSafe(String s) {
        return s != null ? s : "";
    }
}