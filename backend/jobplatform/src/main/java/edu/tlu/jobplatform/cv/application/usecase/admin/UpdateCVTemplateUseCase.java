package edu.tlu.jobplatform.cv.application.usecase.admin;

import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.repository.CVTemplateRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateCVTemplateUseCase {

    private final CVTemplateRepository templateRepository;

    public record Command(
            UUID templateId,
            String name,
            String thumbnailUrl,
            String category,
            boolean premium,
            String htmlContent,
            boolean active) {
    }

    @Transactional
    public CVTemplate execute(Command cmd) {
        CVTemplate template = templateRepository.findById(cmd.templateId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Template không tồn tại.", "TEMPLATE_NOT_FOUND"));

        if (cmd.htmlContent() == null || cmd.htmlContent().isBlank()) {
            throw new BusinessRuleException(
                    "HTML content không được để trống.", "TEMPLATE_CONTENT_EMPTY");
        }

        template.update(cmd.name(), cmd.thumbnailUrl(), cmd.category(),
                cmd.premium(), cmd.htmlContent(), cmd.active());

        CVTemplate saved = templateRepository.save(template);
        log.info("CVTemplate updated by admin: id={} name={} active={}",
                saved.getId(), saved.getName(), saved.isActive());
        return saved;
    }
}