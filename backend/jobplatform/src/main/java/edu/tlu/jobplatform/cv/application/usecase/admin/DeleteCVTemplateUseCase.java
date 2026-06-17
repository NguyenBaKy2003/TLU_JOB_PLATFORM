package edu.tlu.jobplatform.cv.application.usecase.admin;

import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.repository.CVTemplateRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Xoá vĩnh viễn một CV template.
 *
 * Business rules:
 * - Template phải tồn tại.
 * - Template đang ACTIVE không được xoá trực tiếp →
 * admin phải deactivate trước (tránh xoá nhầm template đang dùng).
 * - Các OnlineCV đã tham chiếu template này vẫn render bình thường
 * vì HTML đã được snapshot vào CV hoặc templateId chỉ là reference.
 */
@Service
@RequiredArgsConstructor
public class DeleteCVTemplateUseCase {

    private final CVTemplateRepository templateRepository;

    @Transactional
    public void execute(UUID templateId) {
        CVTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "CV Template không tồn tại: " + templateId, "TEMPLATE_NOT_FOUND"));

        if (template.isActive()) {
            throw new IllegalStateException(
                    "Không thể xoá template đang active. Hãy deactivate trước.");
        }

        templateRepository.deleteById(templateId);
    }
}