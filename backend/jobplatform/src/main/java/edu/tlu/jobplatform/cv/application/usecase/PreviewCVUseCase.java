package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.application.service.CVRenderService;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PreviewCVUseCase {

    private final OnlineCVRepository cvRepository;
    private final CVRenderService cvRenderService;

    public String execute(UUID cvId, UUID candidateId) {
        OnlineCV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new BusinessRuleException(
                        "CV không tồn tại.", "CV_NOT_FOUND"));

        if (!cv.getCandidateId().equals(candidateId))
            throw new BusinessRuleException("Không có quyền.", "CV_ACCESS_DENIED");

        return cvRenderService.render(cv);
    }
}