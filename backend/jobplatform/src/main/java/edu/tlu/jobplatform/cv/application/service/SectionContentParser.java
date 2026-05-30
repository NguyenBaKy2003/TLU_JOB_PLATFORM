package edu.tlu.jobplatform.cv.application.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.cv.domain.model.vo.SectionType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class SectionContentParser {

    private final ObjectMapper objectMapper;

    // TypeReference dùng lại, không cần new mỗi lần
    private static final TypeReference<List<Map<String, Object>>> LIST_MAP_REF = new TypeReference<>() {
    };

    private static final TypeReference<List<String>> LIST_STRING_REF = new TypeReference<>() {
    };

    public Object parse(SectionType type, String content) {
        if (content == null || content.isBlank())
            return null;
        try {
            return switch (type) {
                case SUMMARY -> {
                    JsonNode node = objectMapper.readTree(content);
                    yield node.path("text").asText("");
                }
                case SKILL ->
                    objectMapper.readValue(content, LIST_STRING_REF);

                case EXPERIENCE, EDUCATION, LANGUAGE, SOCIAL_LINK ->
                    objectMapper.readValue(content, LIST_MAP_REF);

                default -> content;
            };
        } catch (Exception e) {
            return content; // fallback raw nếu parse lỗi
        }
    }
}