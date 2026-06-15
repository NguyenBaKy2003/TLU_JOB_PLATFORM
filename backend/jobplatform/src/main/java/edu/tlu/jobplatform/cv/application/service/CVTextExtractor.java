package edu.tlu.jobplatform.cv.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.cv.domain.model.CVSection;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.model.vo.PersonalInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Serialize OnlineCV → plain text để AI scorer đọc.
 *
 * Dùng khi:
 * - exportedPdfUrl == null (CV cũ chưa export PDF)
 * - Fallback khi download PDF từ S3 thất bại
 *
 * Không dùng SectionContentParser vì chỉ cần text thô, không cần typed object.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CVTextExtractor {

    private static final int MAX_CHARS = 8000;
    private final ObjectMapper objectMapper;

    public String extract(OnlineCV cv) {
        StringBuilder sb = new StringBuilder(2048);

        appendPersonalInfo(sb, cv.getPersonalInfo());
        cv.getVisibleSections().forEach(s -> appendSection(sb, s));

        String text = sb.toString().trim();
        if (text.length() > MAX_CHARS) {
            text = text.substring(0, MAX_CHARS) + "...[truncated]";
        }

        log.info("CV text extracted from entity: cvId={} chars={}", cv.getId(), text.length());
        return text;
    }

    // ── Personal Info ─────────────────────────────────────────────────────────

    private void appendPersonalInfo(StringBuilder sb, PersonalInfo info) {
        if (info == null)
            return;

        appendIfPresent(sb, "Họ tên", info.getFullName());
        appendIfPresent(sb, "Email", info.getEmail());
        appendIfPresent(sb, "Điện thoại", info.getPhone());
        appendIfPresent(sb, "Địa chỉ", info.getAddress());
        appendIfPresent(sb, "Tiêu đề", info.getHeadline());
        sb.append("\n");
    }

    // ── Section dispatch ──────────────────────────────────────────────────────

    private void appendSection(StringBuilder sb, CVSection section) {
        sb.append("## ").append(section.getTitle()).append("\n");
        try {
            switch (section.getType()) {
                case SUMMARY -> appendSummary(sb, section.getContent());
                case EXPERIENCE -> appendExperience(sb, section.getContent());
                case EDUCATION -> appendEducation(sb, section.getContent());
                case SKILL -> appendSkill(sb, section.getContent());
                case PROJECT -> appendProject(sb, section.getContent());
                case CERTIFICATE -> appendCertificate(sb, section.getContent());
                case LANGUAGE -> appendLanguage(sb, section.getContent());
                case SOCIAL_LINK -> appendSocialLink(sb, section.getContent());
                default -> appendRaw(sb, section.getContent());
            }
        } catch (Exception e) {
            log.warn("Failed to parse section content: sectionId={} type={} error={}",
                    section.getId(), section.getType(), e.getMessage());
            appendRaw(sb, section.getContent());
        }
        sb.append("\n");
    }

    // ── Section renderers ─────────────────────────────────────────────────────

    /** {"text": "..."} */
    private void appendSummary(StringBuilder sb, String content) throws Exception {
        Map<String, Object> map = objectMapper.readValue(content, new TypeReference<>() {
        });
        String text = (String) map.get("text");
        if (text != null && !text.isBlank()) {
            sb.append(text).append("\n");
        }
    }

    /** [{ company, position, startDate, endDate?, current, description }] */
    private void appendExperience(StringBuilder sb, String content) throws Exception {
        List<Map<String, Object>> items = objectMapper.readValue(content, new TypeReference<>() {
        });
        for (Map<String, Object> item : items) {
            sb.append("- ").append(item.getOrDefault("position", "")).append(" tại ")
                    .append(item.getOrDefault("company", "")).append("\n");
            appendIfPresent(sb, "  Từ", strOf(item.get("startDate")));
            if (Boolean.TRUE.equals(item.get("current"))) {
                sb.append("  Đến nay\n");
            } else {
                appendIfPresent(sb, "  Đến", strOf(item.get("endDate")));
            }
            appendIfPresent(sb, "  Mô tả", strOf(item.get("description")));
        }
    }

    /** [{ school, degree, major, startDate, endDate? }] */
    private void appendEducation(StringBuilder sb, String content) throws Exception {
        List<Map<String, Object>> items = objectMapper.readValue(content, new TypeReference<>() {
        });
        for (Map<String, Object> item : items) {
            sb.append("- ").append(item.getOrDefault("school", "")).append("\n");
            appendIfPresent(sb, "  Bằng", strOf(item.get("degree")));
            appendIfPresent(sb, "  Chuyên ngành", strOf(item.get("major")));
            appendIfPresent(sb, "  Từ", strOf(item.get("startDate")));
            appendIfPresent(sb, "  Đến", strOf(item.get("endDate")));
        }
    }

    /** ["skill1", "skill2"] hoặc [{ name, level }] */
    private void appendSkill(StringBuilder sb, String content) throws Exception {
        // Thử parse dưới dạng list of string trước
        try {
            List<String> skills = objectMapper.readValue(content, new TypeReference<>() {
            });
            sb.append(String.join(", ", skills)).append("\n");
        } catch (Exception e) {
            // Nếu không phải string list → thử list of object
            List<Map<String, Object>> items = objectMapper.readValue(content, new TypeReference<>() {
            });
            for (Map<String, Object> item : items) {
                sb.append("- ").append(item.getOrDefault("name", ""));
                Object level = item.get("level");
                if (level != null)
                    sb.append(" (").append(level).append(")");
                sb.append("\n");
            }
        }
    }

    /** [{ name, description, techStack, url }] */
    private void appendProject(StringBuilder sb, String content) throws Exception {
        List<Map<String, Object>> items = objectMapper.readValue(content, new TypeReference<>() {
        });
        for (Map<String, Object> item : items) {
            sb.append("- ").append(item.getOrDefault("name", "")).append("\n");
            appendIfPresent(sb, "  Mô tả", strOf(item.get("description")));
            appendIfPresent(sb, "  Tech stack", strOf(item.get("techStack")));
        }
    }

    /** [{ name, issuer, issuedAt }] */
    private void appendCertificate(StringBuilder sb, String content) throws Exception {
        List<Map<String, Object>> items = objectMapper.readValue(content, new TypeReference<>() {
        });
        for (Map<String, Object> item : items) {
            sb.append("- ").append(item.getOrDefault("name", ""));
            Object issuer = item.get("issuer");
            if (issuer != null)
                sb.append(" — ").append(issuer);
            sb.append("\n");
        }
    }

    /** [{ name, level }] */
    private void appendLanguage(StringBuilder sb, String content) throws Exception {
        List<Map<String, Object>> items = objectMapper.readValue(content, new TypeReference<>() {
        });
        for (Map<String, Object> item : items) {
            sb.append("- ").append(item.getOrDefault("name", ""));
            Object level = item.get("level");
            if (level != null)
                sb.append(": ").append(level);
            sb.append("\n");
        }
    }

    /** [{ platform, url }] */
    private void appendSocialLink(StringBuilder sb, String content) throws Exception {
        List<Map<String, Object>> items = objectMapper.readValue(content, new TypeReference<>() {
        });
        for (Map<String, Object> item : items) {
            sb.append("- ").append(item.getOrDefault("platform", "")).append(": ")
                    .append(item.getOrDefault("url", "")).append("\n");
        }
    }

    /** Fallback: dump JSON thô */
    private void appendRaw(StringBuilder sb, String content) {
        if (content != null && !content.isBlank()) {
            sb.append(content).append("\n");
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void appendIfPresent(StringBuilder sb, String label, String value) {
        if (value != null && !value.isBlank()) {
            sb.append(label).append(": ").append(value).append("\n");
        }
    }

    private String strOf(Object o) {
        return o == null ? null : o.toString();
    }
}