package edu.tlu.jobplatform.livestream.application.usecase.employer;

import edu.tlu.jobplatform.livestream.domain.model.LiveStreamSession;
import edu.tlu.jobplatform.livestream.domain.model.StreamEvent;
import edu.tlu.jobplatform.livestream.domain.model.vo.StreamEventType;
import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.livestream.domain.repository.StreamEventRepository;
import edu.tlu.jobplatform.livestream.domain.service.SessionDomainService;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

// ============================================================
// SpotlightJobPostUseCase
// ============================================================
@Service
@RequiredArgsConstructor
public class SpotlightJobPostUseCase {

    private final LiveStreamSessionRepository sessionRepository;
    private final StreamEventRepository eventRepository;
    private final SessionDomainService sessionDomainService;

    public record Command(UUID sessionId, UUID requestingUserId, UUID jobPostId, UUID jobCompanyId) {
    }

    @Transactional
    public StreamEvent execute(Command cmd) {
        LiveStreamSession session = sessionRepository.findById(cmd.sessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiên stream"));

        sessionDomainService.validateCanSpotlightJob(session, cmd.jobCompanyId());

        // Payload JSON: {"jobPostId": "...", "action": "spotlight"}
        String payload = """
                {"jobPostId":"%s","action":"spotlight"}
                """.formatted(cmd.jobPostId());

        StreamEvent event = StreamEvent.of(
                cmd.sessionId(),
                cmd.requestingUserId(),
                StreamEventType.JOB_SPOTLIGHT,
                payload);

        StreamEvent saved = eventRepository.save(event);

        // Publish để WebSocket push realtime cho tất cả viewer
        // eventPublisher.publishEvent(new StreamEventCreatedEvent(saved));

        return saved;
    }
}
