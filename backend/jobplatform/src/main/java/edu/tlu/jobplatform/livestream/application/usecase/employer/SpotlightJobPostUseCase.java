package edu.tlu.jobplatform.livestream.application.usecase.employer;

import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.WorkLocation;
import edu.tlu.jobplatform.livestream.domain.model.LiveStreamSession;
import edu.tlu.jobplatform.livestream.domain.model.StreamEvent;
import edu.tlu.jobplatform.livestream.domain.model.vo.StreamEventType;
import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.livestream.domain.repository.StreamEventRepository;
import edu.tlu.jobplatform.livestream.domain.service.SessionDomainService;
import edu.tlu.jobplatform.livestream.infrastructure.event.StreamEventCreatedEvent;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SpotlightJobPostUseCase {

        private final LiveStreamSessionRepository sessionRepository;
        private final StreamEventRepository eventRepository;
        private final SessionDomainService sessionDomainService;
        private final ApplicationEventPublisher eventPublisher;
        private final JobPostRepository jobPostRepository; // ← THÊM
        private final CompanyRepository companyProfileRepository; // ← THÊM

        public record Command(UUID sessionId, UUID requestingUserId, UUID jobPostId, UUID jobCompanyId) {
        }

        @Transactional
        public StreamEvent execute(Command cmd) {
                LiveStreamSession session = sessionRepository.findById(cmd.sessionId())
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiên stream"));

                sessionDomainService.validateCanSpotlightJob(session, cmd.jobCompanyId());

                JobPost jobPost = jobPostRepository.findById(cmd.jobPostId())
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy job post"));

                String companyName = companyProfileRepository.findById(jobPost.getCompanyId())
                                .map(c -> c.getName() != null ? c.getName() : "")
                                .orElse("");

                // ✅ WorkLocation chỉ có city, không có country
                String location = "";
                if (jobPost.getWorkLocation() != null) {
                        WorkLocation wl = jobPost.getWorkLocation();
                        if (wl.getType() == WorkLocation.LocationType.REMOTE) {
                                location = "Remote";
                        } else if (wl.getCity() != null && !wl.getCity().isBlank()) {
                                location = wl.getCity();
                        }
                }

                // ✅ Salary dùng display() không phải toDisplayString()
                String salaryRange = "";
                if (jobPost.getSalary() != null) {
                        salaryRange = jobPost.getSalary().display();
                }

                String payload = """
                                {"jobPostId":"%s","title":"%s","companyName":"%s","location":"%s","salaryRange":"%s","action":"spotlight"}
                                """
                                .formatted(
                                                cmd.jobPostId(),
                                                escapeJson(jobPost.getTitle()),
                                                escapeJson(companyName),
                                                escapeJson(location),
                                                escapeJson(salaryRange))
                                .strip();

                StreamEvent event = StreamEvent.of(
                                cmd.sessionId(),
                                cmd.requestingUserId(),
                                StreamEventType.JOB_SPOTLIGHT,
                                payload);

                StreamEvent saved = eventRepository.save(event);

                eventPublisher.publishEvent(new StreamEventCreatedEvent(saved));

                eventPublisher.publishEvent(
                                new edu.tlu.jobplatform.shared.event.livestream.StreamEventCreatedEvent(
                                                null, cmd.sessionId(), StreamEventType.JOB_SPOTLIGHT, payload));

                return saved;
        }

        private String escapeJson(String value) {
                if (value == null)
                        return "";
                return value
                                .replace("\\", "\\\\")
                                .replace("\"", "\\\"")
                                .replace("\n", "\\n")
                                .replace("\r", "\\r")
                                .replace("\t", "\\t");
        }
}