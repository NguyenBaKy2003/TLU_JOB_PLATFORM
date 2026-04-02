package edu.tlu.jobplatform.job.infrastructure.event;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Publisher: Phát Spring Application Events sau khi JobPost thay đổi trạng
 * thái.
 *
 * Các module khác (Notification, Search Index, Analytics) lắng nghe events này
 * qua @EventListener — không cần biết Job domain.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JobEventPublisher {

    private final ApplicationEventPublisher publisher;

    public void publishJobPublished(JobPost job) {
        publisher.publishEvent(new JobPublishedEvent(
                job.getId(), job.getCompanyId(),
                job.getTitle(), job.getCategoryCode(),
                job.isFeatured(), job.getDeadline()));
        log.debug("Event published: JobPublished id={}", job.getId());
    }

    public void publishJobClosed(JobPost job) {
        publisher.publishEvent(new JobClosedEvent(job.getId(), job.getCompanyId()));
        log.debug("Event published: JobClosed id={}", job.getId());
    }

    public void publishJobExpired(JobPost job) {
        publisher.publishEvent(new JobExpiredEvent(job.getId(), job.getCompanyId()));
        log.debug("Event published: JobExpired id={}", job.getId());
    }

    // ── Event records ─────────────────────────────────────────

    public record JobPublishedEvent(
            java.util.UUID jobPostId,
            java.util.UUID companyId,
            String title,
            String categoryCode,
            boolean featured,
            java.time.LocalDateTime deadline) {
    }

    public record JobClosedEvent(
            java.util.UUID jobPostId,
            java.util.UUID companyId) {
    }

    public record JobExpiredEvent(
            java.util.UUID jobPostId,
            java.util.UUID companyId) {
    }
}