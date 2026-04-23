package edu.tlu.jobplatform.cv.application.usecase.admin;

import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.repository.CVTemplateRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Admin tao template CV moi bang cach upload HTML content qua API.
 * Khong can chinh sua code hay deploy lai backend.
 *
 * HTML content phai la XHTML hop le (strict XML) de Flying Saucer render duoc.
 * Co the dung bien Thymeleaf: th:text, th:if, th:each voi bien:
 * - ${personalInfo} -> PersonalInfo object
 * - ${sections} -> List<CVSection> (visible, sorted by displayOrder)
 * - ${sectionsByType} -> Map<String, List<CVSection>>
 * - ${cv} -> OnlineCV object
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CreateCVTemplateUseCase {

    private final CVTemplateRepository templateRepository;

    public record Command(
            String name,
            String thumbnailUrl,
            String category,
            boolean premium,
            String htmlContent) {
    }

    @Transactional
    public CVTemplate execute(Command cmd) {
        if (cmd.htmlContent() == null || cmd.htmlContent().isBlank()) {
            throw new BusinessRuleException(
                    "HTML content không được để trống.", "TEMPLATE_CONTENT_EMPTY");
        }

        String trimmed = cmd.htmlContent().trim();
        String lower = trimmed.toLowerCase();

        // Chặn placeholder — dấu hiệu là có "..." bên trong tag
        if (trimmed.contains("...>") || trimmed.contains("<html>...</html>")) {
            throw new BusinessRuleException(
                    "HTML content trông như placeholder. Vui lòng upload HTML thật.",
                    "TEMPLATE_PLACEHOLDER_DETECTED");
        }

        if (!lower.startsWith("<?xml") && !lower.startsWith("<!doctype") && !lower.startsWith("<html")) {
            throw new BusinessRuleException(
                    "HTML content phải là XHTML hợp lệ (bắt đầu bằng <?xml, <!DOCTYPE, hoặc <html>).",
                    "TEMPLATE_INVALID_HTML");
        }

        // Kiểm tra có thẻ <body> không — placeholder thường không có
        if (!lower.contains("<body") || !lower.contains("</body>")) {
            throw new BusinessRuleException(
                    "HTML content phải có thẻ <body>.</body>.",
                    "TEMPLATE_MISSING_BODY");
        }

        // Kiểm tra độ dài tối thiểu — HTML thật thường > 200 chars
        if (trimmed.length() < 200) {
            throw new BusinessRuleException(
                    "HTML content quá ngắn, có thể không hợp lệ.",
                    "TEMPLATE_TOO_SHORT");
        }

        CVTemplate template = CVTemplate.builder()
                .id(UUID.randomUUID())
                .name(cmd.name())
                .thumbnailUrl(cmd.thumbnailUrl())
                .category(cmd.category())
                .premium(cmd.premium())
                .htmlContent(cmd.htmlContent())
                .active(true)
                .build();

        CVTemplate saved = templateRepository.save(template);
        log.info("CVTemplate created: id={} name={} size={}chars",
                saved.getId(), saved.getName(), cmd.htmlContent().length());
        return saved;
    }
}