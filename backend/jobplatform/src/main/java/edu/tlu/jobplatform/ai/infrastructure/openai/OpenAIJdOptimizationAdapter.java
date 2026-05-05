package edu.tlu.jobplatform.ai.infrastructure.openai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
        log.info("JD optimization: title='{}'", truncate(request.getOriginalTitle(), 50));

        try {
            // Đọc file và replace — thêm $benefits$
            String prompt = promptTemplate
                    .getContentAsString(StandardCharsets.UTF_8)
                    .replace("$title$", nullSafe(request.getOriginalTitle()))
                    .replace("$level$", nullSafe(request.getLevel()))
                    .replace("$category$", nullSafe(request.getCategory()))
                    .replace("$description$", stripHtml(request.getOriginalDescription()))
                    .replace("$requirements$", stripHtml(request.getOriginalRequirements()))
                    .replace("$benefits$", stripHtml(request.getOriginBenefits()));

            String raw = chatClient.prompt().user(prompt).call().content();
            String clean = cleanJsonResponse(raw);

            JsonNode root = objectMapper.readTree(clean);

            // Fix tất cả các trường có thể bị AI trả về dạng Object
            boolean fixed = false;
            fixed |= fixFieldToString(root, "improvedDescription");
            fixed |= fixFieldToString(root, "improvedRequirements");
            fixed |= fixFieldToString(root, "improvedBenefits");

            if (fixed) {
                log.warn("Fixed object-to-string conversion in AI response for title='{}'",
                        truncate(request.getOriginalTitle(), 30));
            }

            if (root.get("improvedBenefits") == null || root.get("improvedBenefits").asText().isEmpty()) {
                ((ObjectNode) root).put("improvedBenefits", nullSafe(request.getOriginBenefits()));
            }

            return objectMapper.treeToValue(root, JdOptimizationResult.class);

        } catch (Exception e) {
            log.error("JD optimization failed: {}", e.getMessage());
            return buildFallbackResult(request);
        }
    }

    /**
     * Fix trường bị AI trả về dạng Object thay vì String
     * 
     * @return true nếu đã fix
     */
    private boolean fixFieldToString(JsonNode root, String fieldName) {
        JsonNode field = root.get(fieldName);

        if (field == null || field.isNull()) {
            if (root instanceof ObjectNode) {
                ((ObjectNode) root).put(fieldName, "");
                return true;
            }
        }

        if (field != null && field.isObject()) {
            String stringValue = field.toString();
            if (root instanceof ObjectNode) {
                ((ObjectNode) root).put(fieldName, stringValue);
                log.debug("Converted field '{}' from Object to String: {}",
                        fieldName, truncate(stringValue, 50));
            }
            return true;
        }

        if (field != null && field.isArray()) {
            StringBuilder sb = new StringBuilder();
            for (JsonNode item : field) {
                if (sb.length() > 0)
                    sb.append("\n");
                sb.append(item.asText());
            }
            if (root instanceof ObjectNode) {
                ((ObjectNode) root).put(fieldName, sb.toString());
                log.debug("Converted field '{}' from Array to String", fieldName);
            }
            return true;
        }

        return false;
    }

    private String cleanJsonResponse(String raw) {
        if (raw == null || raw.isBlank()) {
            return "{}";
        }

        String clean = raw.trim();
        clean = clean.replaceAll("(?s)^```(?:json)?\\s*", "")
                .replaceAll("(?s)```\\s*$", "")
                .trim();

        int startIndex = clean.indexOf('{');
        int endIndex = clean.lastIndexOf('}');

        if (startIndex >= 0 && endIndex > startIndex) {
            clean = clean.substring(startIndex, endIndex + 1);
        }

        return clean;
    }

    private JdOptimizationResult buildFallbackResult(JdOptimizationRequest request) {
        return JdOptimizationResult.builder()
                .improvedTitle(request.getOriginalTitle())
                .improvedDescription(nullSafe(request.getOriginalDescription()))
                .improvedRequirements(nullSafe(request.getOriginalRequirements()))
                .improvedBenefits(nullSafe(request.getOriginBenefits()))
                .suggestions(List.of(
                        "Không thể tối ưu tự động. Vui lòng chỉnh sửa thủ công.",
                        "Đảm bảo JD không chứa yếu tố phân biệt đối xử.",
                        "Thêm mô tả chi tiết về công việc, yêu cầu và phúc lợi."))
                .qualityScore(50)
                .build();
    }

    private String nullSafe(String s) {
        return s != null ? s : "";
    }

    private String truncate(String s, int max) {
        if (s == null)
            return "null";
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }

    private String stripHtml(String html) {
        if (html == null || html.isBlank())
            return "";
        return html
                .replaceAll("(?i)<br\\s*/?>", "\n") // <br> → xuống dòng
                .replaceAll("(?i)<p[^>]*>", "") // mở <p> → bỏ
                .replaceAll("(?i)</p>", "\n") // đóng </p> → xuống dòng
                .replaceAll("(?i)<li[^>]*>", "- ") // <li> → bullet
                .replaceAll("(?i)</li>", "\n") // </li> → xuống dòng
                .replaceAll("<[^>]+>", "") // bỏ tất cả tag còn lại
                .replaceAll("&nbsp;", " ") // &nbsp; → space
                .replaceAll("&amp;", "&")
                .replaceAll("&lt;", "<")
                .replaceAll("&gt;", ">")
                .replaceAll("\n{3,}", "\n\n") // collapse nhiều dòng trắng
                .trim();
    }
}