package edu.tlu.jobplatform.ai.infrastructure.openai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.ai.domain.model.CvAnalysisRequest;
import edu.tlu.jobplatform.ai.domain.model.CvAnalysisResult;
import edu.tlu.jobplatform.ai.domain.port.CvAnalysisPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Primary
@Component
@Profile("!test")
public class OpenAICvAnalysisAdapter implements CvAnalysisPort {

    private static final int MIN_CV_LENGTH = 100;
    private static final int MIN_MEANINGFUL_LINES = 3;
    private static final int LINE_MEANINGFUL_THRESHOLD = 15;

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;
    private final String systemInstruction;
    private final String userTemplate;

    public OpenAICvAnalysisAdapter(
            @Qualifier("jsonChatClient") ChatClient chatClient,
            ObjectMapper objectMapper,
            @Value("classpath:prompts/cv-scoring-system.st") Resource systemResource,
            @Value("classpath:prompts/cv-scoring-user.st") Resource userResource)
            throws IOException {
        this.chatClient = chatClient;
        this.objectMapper = objectMapper;
        this.systemInstruction = systemResource.getContentAsString(StandardCharsets.UTF_8);
        this.userTemplate = userResource.getContentAsString(StandardCharsets.UTF_8);
    }

    // ── Public API ──────────

    @Override
    public CvAnalysisResult analyze(CvAnalysisRequest request) {
        log.info("CV analysis start: applicationId={} jobTitle='{}'",
                request.getApplicationId(), request.getJobTitle());

        String cvText = nullSafe(request.getCvText()).trim();

        // Guard 1 — CV rỗng hoàn toàn
        if (cvText.isBlank()) {
            log.warn("CV text is blank, skipping AI — applicationId={}",
                    request.getApplicationId());
            return emptyCvResult("CV không có nội dung. Vui lòng kiểm tra lại file đã upload.");
        }

        // Guard 2 — CV chỉ có tiêu đề section, chưa điền nội dung
        if (!isCvMeaningful(cvText)) {
            log.warn("CV appears template-only ({} chars, <{} meaningful lines) — applicationId={}",
                    cvText.length(), MIN_MEANINGFUL_LINES, request.getApplicationId());
            return emptyCvResult(
                    "CV chỉ có tiêu đề, chưa được điền nội dung. " +
                            "Ứng viên cần cập nhật CV trước khi ứng tuyển.");
        }

        try {
            String system = buildSystemInstruction(request);
            String user = buildUserContent(cvText);

            String raw = chatClient.prompt()
                    .system(system) // instruction — AI coi là "luật"
                    .user(user) // CV text thuần — AI coi là "dữ liệu"
                    .call()
                    .content();

            CvAnalysisResult result = parseResponse(raw);
            return validate(result);

        } catch (JsonProcessingException e) {
            log.error("CV analysis: AI returned invalid JSON — applicationId={}: {}",
                    request.getApplicationId(), e.getMessage());
            return fallbackResult();
        } catch (Exception e) {
            log.error("CV analysis failed — applicationId={}: {}",
                    request.getApplicationId(), e.getMessage());
            return fallbackResult();
        }
    }

    // ── Prompt builders ─────

    /**
     * System message: chứa toàn bộ instruction + thông tin JD.
     * Tách khỏi CV text để tránh prompt injection từ nội dung CV.
     */
    private String buildSystemInstruction(CvAnalysisRequest request) {
        return systemInstruction
                .replace("$jobTitle$", nullSafe(request.getJobTitle()))
                .replace("$jobLevel$", nullSafe(request.getJobLevel()))
                .replace("$jobDescription$", nullSafe(request.getJobDescription()))
                .replace("$jobRequirements$", nullSafe(request.getJobRequirements()));
    }

    /**
     * User message: chỉ chứa raw CV text — không có instruction nào.
     */
    private String buildUserContent(String cvText) {
        return userTemplate.replace("$cvText$", truncate(cvText, 6000));
    }

    // ── Response handling ───

    private CvAnalysisResult parseResponse(String raw) throws JsonProcessingException {
        String clean = raw.trim()
                .replaceAll("(?s)^```json\\s*", "")
                .replaceAll("(?s)```\\s*$", "")
                .trim();
        return objectMapper.readValue(clean, CvAnalysisResult.class);
    }

    /**
     * Clamp scores về [0,100] và null-safe các list,
     * phòng AI trả về giá trị ngoài range hoặc thiếu field.
     */
    private CvAnalysisResult validate(CvAnalysisResult r) {
        return r.toBuilder()
                .overallScore(clamp(r.getOverallScore()))
                .skillMatchScore(clamp(r.getSkillMatchScore()))
                .experienceScore(clamp(r.getExperienceScore()))
                .educationScore(clamp(r.getEducationScore()))
                .strengths(r.getStrengths() != null ? r.getStrengths() : List.of())
                .gaps(r.getGaps() != null ? r.getGaps() : List.of())
                .build();
    }

    // ── Guard helpers ───────

    /**
     * CV có nghĩa khi: đủ dài VÀ có ít nhất N dòng nội dung thực
     * (không chỉ là heading như "KỸ NĂNG", "HỌC VẤN"...).
     */
    private boolean isCvMeaningful(String cvText) {
        if (cvText.length() < MIN_CV_LENGTH)
            return false;

        long meaningfulLines = cvText.lines()
                .map(String::trim)
                .filter(line -> line.length() > LINE_MEANINGFUL_THRESHOLD)
                .count();

        return meaningfulLines >= MIN_MEANINGFUL_LINES;
    }

    // ── Result factories ────

    private CvAnalysisResult emptyCvResult(String reason) {
        return CvAnalysisResult.builder()
                .overallScore(0).skillMatchScore(0)
                .experienceScore(0).educationScore(0)
                .strengths(List.of())
                .gaps(List.of(reason))
                .summary(reason)
                .build();
    }

    private CvAnalysisResult fallbackResult() {
        return CvAnalysisResult.builder()
                .overallScore(0).skillMatchScore(0)
                .experienceScore(0).educationScore(0)
                .strengths(List.of())
                .gaps(List.of("Không thể phân tích tự động"))
                .summary("Lỗi hệ thống. Vui lòng xem xét CV thủ công.")
                .build();
    }

    // ── Utilities ───────────

    private int clamp(Integer value) {
        if (value == null)
            return 0;
        return Math.max(0, Math.min(100, value));
    }

    private String truncate(String text, int maxChars) {
        return text.length() <= maxChars
                ? text
                : text.substring(0, maxChars) + "\n...[truncated]";
    }

    private String nullSafe(String s) {
        return s != null ? s : "";
    }
}