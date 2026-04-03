package edu.tlu.jobplatform.job.infrastructure.event;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.shared.event.job.JobClosedEvent;
import edu.tlu.jobplatform.shared.event.job.JobExpiredEvent;
import edu.tlu.jobplatform.shared.event.job.JobPublishedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Component chịu trách nhiệm fire Job domain events.
 * Tách ra khỏi UseCase để UseCase không biết về infrastructure.
 *
 * Consumers:
 * JobPublishedEvent → Search index + AI embedding (Sprint 5)
 * JobClosedEvent → Search remove index
 * JobExpiredEvent → Search remove + Email thông báo (Sprint 4)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JobEventPublisher {

    private final ApplicationEventPublisher eventPublisher;

    public void publishJobPublished(JobPost job) {
        var event = new JobPublishedEvent(
                job.getId(),
                job.getCompanyId(),
                job.getTitle(),
                job.toFullText(),
                job.getSlug());
        eventPublisher.publishEvent(event);
        log.debug("JobPublishedEvent fired: jobId={}", job.getId());
    }

    public void publishJobClosed(JobPost job) {
        var event = new JobClosedEvent(job.getId(), job.getCompanyId());
        eventPublisher.publishEvent(event);
        log.debug("JobClosedEvent fired: jobId={}", job.getId());
    }

    public void publishJobExpired(JobPost job) {
        var event = new JobExpiredEvent(job.getId(), job.getCompanyId(), job.getTitle());
        eventPublisher.publishEvent(event);
        log.debug("JobExpiredEvent fired: jobId={}", job.getId());
    }
}