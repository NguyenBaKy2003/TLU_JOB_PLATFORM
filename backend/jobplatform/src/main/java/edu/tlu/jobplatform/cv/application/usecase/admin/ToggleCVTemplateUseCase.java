package edu.tlu.jobplatform.cv.application.usecase.admin;

import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.repository.CVTemplateRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Bật / tắt template mà không xóa.
 * Template bị deactivate sẽ ẩn khỏi danh sách candidate nhưng
 * các CV đã dùng template này vẫn render được bình thường.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ToggleCVTemplateUseCase {

    private final CVTemplateRepository templateRepository;

    @Transactional
    public CVTemplate execute(UUID templateId, boolean active) {
        CVTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Template không tồn tại.", "TEMPLATE_NOT_FOUND"));

        if (active) {
            template.activate();
        } else {
            template.deactivate();
        }

        CVTemplate saved = templateRepository.save(template);
        log.info("CVTemplate toggled: id={} active={}", saved.getId(), saved.isActive());
        return saved;
    }
}