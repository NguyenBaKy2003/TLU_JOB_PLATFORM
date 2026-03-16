package edu.tlu.jobplatform.candidate.application.usecase.cv;

import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateCVRepository;
import edu.tlu.jobplatform.candidate.domain.service.CVDomainService;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SetPrimaryCVUseCase {

    private final CandidateCVRepository cvRepository;
    private final CVDomainService cvDomainService;

    @Transactional
    public void execute(UUID candidateId, UUID cvId) {
        List<CandidateCV> allCVs = cvRepository.findAllByCandidateId(candidateId);

        CandidateCV target = allCVs.stream()
                .filter(cv -> cv.getId().equals(cvId))
                .findFirst()
                .orElseThrow(() -> new BusinessRuleException(
                        "CV không tồn tại.", "CV_NOT_FOUND"));

        cvDomainService.switchPrimary(allCVs, target);
        cvRepository.saveAll(allCVs);
    }
}