package edu.tlu.jobplatform.cv.application.usecase.admin;

import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.repository.CVTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Admin xem toàn bộ templates — kể cả inactive. */
@Service
@RequiredArgsConstructor
public class GetAllCVTemplatesUseCase {

    private final CVTemplateRepository templateRepository;

    @Transactional(readOnly = true)
    public List<CVTemplate> execute() {
        return templateRepository.findAll();
    }
}