package edu.tlu.jobplatform.livestream.application.usecase.candidate;

import edu.tlu.jobplatform.livestream.domain.model.LiveStreamSession;
import edu.tlu.jobplatform.livestream.domain.model.StreamAnalytics;
import edu.tlu.jobplatform.livestream.domain.model.StreamEvent;
import edu.tlu.jobplatform.livestream.domain.model.vo.StreamEventType;
import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.livestream.domain.repository.StreamAnalyticsRepository;
import edu.tlu.jobplatform.livestream.domain.repository.StreamEventRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RespondToPollUseCase {

    private final LiveStreamSessionRepository sessionRepository;
    private final StreamEventRepository eventRepository;
    private final StreamAnalyticsRepository analyticsRepository; // ← THÊM

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
                """.formatted(cmd.pollEventId(), cmd.optionIndex()).strip();

        StreamEvent event = StreamEvent.of(
                cmd.sessionId(), cmd.candidateId(), StreamEventType.POLL_RESPONDED, payload);
        eventRepository.save(event);

        // ✅ Tăng pollResponseCount
        try {
            StreamAnalytics analytics = analyticsRepository
                    .findBySessionId(cmd.sessionId())
                    .orElseGet(() -> StreamAnalytics.createFor(cmd.sessionId()));
            analytics.recordPollResponse();
            analyticsRepository.save(analytics);
        } catch (Exception e) {
            log.warn("Failed to update pollResponseCount for session {}", cmd.sessionId(), e);
        }
    }
}