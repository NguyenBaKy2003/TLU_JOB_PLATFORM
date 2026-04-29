package edu.tlu.jobplatform.livestream.application.usecase.candidate;

import edu.tlu.jobplatform.livestream.domain.model.LiveStreamSession;
import edu.tlu.jobplatform.livestream.domain.model.StreamEvent;
import edu.tlu.jobplatform.livestream.domain.model.vo.StreamEventType;
import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.livestream.domain.repository.StreamEventRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

// ============================================================
// RespondToPollUseCase
// ============================================================
@Service
@RequiredArgsConstructor
public class RespondToPollUseCase {

    private final LiveStreamSessionRepository sessionRepository;
    private final StreamEventRepository eventRepository;

    public record Command(UUID sessionId, UUID candidateId, UUID pollEventId, int optionIndex) {
    }

    @Transactional
    public void execute(Command cmd) {
        LiveStreamSession session = sessionRepository.findById(cmd.sessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiên stream"));

        if (!session.isLive()) {
            throw new IllegalStateException("Phiên stream không còn LIVE");
        }

        String payload = """
                {"pollEventId":"%s","optionIndex":%d}
                """.formatted(cmd.pollEventId(), cmd.optionIndex());

        StreamEvent event = StreamEvent.of(
                cmd.sessionId(), cmd.candidateId(), StreamEventType.POLL_RESPONDED, payload);
        eventRepository.save(event);
        // eventPublisher.publishEvent(new StreamEventCreatedEvent(event));
    }
}
