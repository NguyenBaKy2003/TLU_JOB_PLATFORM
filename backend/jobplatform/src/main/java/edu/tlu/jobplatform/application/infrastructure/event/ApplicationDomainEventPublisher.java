package edu.tlu.jobplatform.application.infrastructure.event;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.shared.event.application.ApplicationStatusChangedEvent;
import edu.tlu.jobplatform.shared.event.application.ApplicationSubmittedEvent;
import edu.tlu.jobplatform.shared.event.application.InterviewScheduledEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Publisher wrap Spring's ApplicationEventPublisher.
 *
 * Các field cần thiết (candidateEmail, candidateName, companyName) được resolve
 * TRONG transaction của UseCase — tránh JPA session đã đóng khi listener chạy
 * async.
 *
 * Fix: candidateEmail null → WARN "Cannot send interview email" đã được giải
 * quyết
 * bằng cách resolve sớm tại đây thay vì để listener fallback query ngoài
 * transaction.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ApplicationDomainEventPublisher {

        private final ApplicationEventPublisher eventPublisher;
        private final CandidateProfileRepository candidateRepo;
        private final CompanyRepository companyRepo;

        private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

        public void publishApplicationSubmitted(Application app, String jobTitle) {
                eventPublisher.publishEvent(new ApplicationSubmittedEvent(
                                app.getId(),
                                app.getJobPostId(),
                                app.getCandidateId(),
                                null,
                                app.getCompanyId(),
                                jobTitle,
                                null,
                                null));
                log.debug("ApplicationSubmittedEvent fired: {}", app.getId());
        }

        // ── publishStatusChanged

        public void publishStatusChanged(Application app, ApplicationStatus prevStatus) {
                eventPublisher.publishEvent(new ApplicationStatusChangedEvent(
                                app.getId(),
                                app.getCandidateId(),
                                null,
                                null,
                                prevStatus.name(),
                                app.getStatus().name(),
                                app.getRejectionReason()));
                log.debug("ApplicationStatusChangedEvent fired: {} → {}", prevStatus, app.getStatus());
        }

        public void publishInterviewScheduled(Application app) {
                String interviewAt = app.getInterviewScheduledAt() != null
                                ? app.getInterviewScheduledAt().format(ISO)
                                : null;

                CandidateProfile candidate = candidateRepo.findByUserId(app.getCandidateId())
                                .orElse(null);

                String candidateEmail = candidate != null ? candidate.getEmail() : null;
                String candidateName = candidate != null
                                ? Stream.of(candidate.getFirstName(), candidate.getLastName())
                                                .filter(s -> s != null && !s.isBlank())
                                                .collect(Collectors.joining(" "))
                                : null;

                String companyName = companyRepo.findById(app.getCompanyId())
                                .map(CompanyProfile::getName)
                                .orElse(null);

                if (candidateEmail == null) {
                        log.warn("publishInterviewScheduled: candidateEmail is null for candidateId={}. " +
                                        "Email sẽ không được gửi.", app.getCandidateId());
                }

                eventPublisher.publishEvent(new InterviewScheduledEvent(
                                app.getId(),
                                app.getCandidateId(),
                                app.getCompanyId(),
                                candidateEmail,
                                candidateName,
                                null,
                                companyName,
                                null,
                                interviewAt,
                                null,
                                app.getInterviewLocation(),
                                app.getInterviewNote()));

                log.debug("InterviewScheduledEvent fired: applicationId={} to={}",
                                app.getId(), candidateEmail);
        }
}