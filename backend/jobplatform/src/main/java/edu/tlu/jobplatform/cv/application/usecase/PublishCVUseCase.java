package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.cv.domain.service.CVDomainService;
import edu.tlu.jobplatform.shared.event.cv.CVPublishedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Publish CV: DRAFT → PUBLISHED.
 *
 * Flow:
 * 1. Load + verify ownership
 * 2. Domain validate (personalInfo, visible sections)
 * 3. Generate unique slug
 * 4. Gọi cv.publish(slug)
 * 5. Save + publish event
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PublishCVUseCase {

    private final OnlineCVRepository cvRepository;
    private final CVDomainService cvDomainService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public OnlineCV execute(UUID cvId, UUID candidateId) {
        OnlineCV cv = cvDomainService.loadAndVerifyOwnership(cvId, candidateId);

        String slug = cvDomainService.generateUniqueSlug(cv.getTitle(), candidateId);
        cv.publish(slug);

        OnlineCV saved = cvRepository.save(cv);

        eventPublisher.publishEvent(new CVPublishedEvent(
                saved.getId(), saved.getCandidateId(), saved.getSlug()));

        log.info("OnlineCV published: cvId={} slug={}", saved.getId(), saved.getSlug());
        return saved;
    }
}