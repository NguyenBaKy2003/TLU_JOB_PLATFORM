package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.repository.CVTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Lấy danh sách template CV để hiển thị trên bước chọn template.
 */
@Service
@RequiredArgsConstructor
public class GetCVTemplatesUseCase {

    private final CVTemplateRepository templateRepository;

    @Transactional(readOnly = true)
    public List<CVTemplate> execute() {
        // Candidate chỉ thấy template đang active
        return templateRepository.findAllActive();
    }
}