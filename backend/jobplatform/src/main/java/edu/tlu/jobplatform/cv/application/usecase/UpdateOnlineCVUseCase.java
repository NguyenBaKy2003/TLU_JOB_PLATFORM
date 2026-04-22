package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.model.vo.CVVisibility;
import edu.tlu.jobplatform.cv.domain.model.vo.PersonalInfo;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.cv.domain.service.CVDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Cập nhật metadata CV: title, personalInfo, templateId, visibility.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateOnlineCVUseCase {

    private final OnlineCVRepository cvRepository;
    private final CVDomainService cvDomainService;

    public record Command(
            UUID cvId,
            UUID candidateId,
            String title,
            PersonalInfo personalInfo,
            UUID templateId,
            CVVisibility visibility) {
    }

    @Transactional
    public OnlineCV execute(Command cmd) {
        OnlineCV cv = cvDomainService.loadAndVerifyOwnership(cmd.cvId(), cmd.candidateId());

        cv.updateMetadata(cmd.title(), cmd.personalInfo(), cmd.templateId(), cmd.visibility());

        OnlineCV saved = cvRepository.save(cv);
        log.info("OnlineCV updated: cvId={}", saved.getId());
        return saved;
    }
}