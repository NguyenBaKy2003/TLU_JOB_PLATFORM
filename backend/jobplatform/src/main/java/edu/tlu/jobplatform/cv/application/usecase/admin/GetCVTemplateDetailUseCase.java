package edu.tlu.jobplatform.cv.application.usecase.admin;

import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.repository.CVTemplateRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Lấy chi tiết một CV template theo ID (kể cả inactive).
 * Dùng cho Admin — trả về cả htmlContent.
 */
@Component
@RequiredArgsConstructor
public class GetCVTemplateDetailUseCase {

    private final CVTemplateRepository templateRepository;

    public CVTemplate execute(UUID templateId) {
        return templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "CV Template không tồn tại: ", "TEMPLATE_NOT_FOUND"));
    }
}