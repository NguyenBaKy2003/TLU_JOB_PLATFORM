package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.cv.domain.service.CVDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeleteCVSectionUseCase {

    private final OnlineCVRepository cvRepository;
    private final CVDomainService cvDomainService;

    @Transactional
    public void execute(UUID cvId, UUID candidateId, UUID sectionId) {
        OnlineCV cv = cvDomainService.loadAndVerifyOwnership(cvId, candidateId);
        cv.removeSection(sectionId);
        cvRepository.save(cv);
        log.info("CVSection deleted: cvId={} sectionId={}", cvId, sectionId);
    }
}