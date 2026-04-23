package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.cv.domain.service.CVDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Sắp xếp lại thứ tự sections — thường gọi sau khi user drag-and-drop trên UI.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReorderSectionsUseCase {

    private final OnlineCVRepository cvRepository;
    private final CVDomainService cvDomainService;

    public record Command(UUID cvId, UUID candidateId, List<UUID> sectionIds) {
    }

    @Transactional
    public OnlineCV execute(Command cmd) {
        OnlineCV cv = cvDomainService.loadAndVerifyOwnership(cmd.cvId(), cmd.candidateId());
        cv.reorderSections(cmd.sectionIds());
        return cvRepository.save(cv);
    }
}