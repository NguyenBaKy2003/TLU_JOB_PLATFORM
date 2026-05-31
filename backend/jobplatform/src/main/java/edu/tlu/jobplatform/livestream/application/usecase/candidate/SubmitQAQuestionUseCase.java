package edu.tlu.jobplatform.livestream.application.usecase.candidate;

import edu.tlu.jobplatform.livestream.domain.model.LiveStreamSession;
import edu.tlu.jobplatform.livestream.domain.model.QAQuestion;
import edu.tlu.jobplatform.livestream.domain.model.StreamAnalytics;
import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.livestream.domain.repository.QAQuestionRepository;
import edu.tlu.jobplatform.livestream.domain.repository.StreamAnalyticsRepository;
import edu.tlu.jobplatform.livestream.presentation.dto.ws.payload.QAQuestionPayload;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.websocket.application.port.out.WsPushPort;
import edu.tlu.jobplatform.websocket.domain.model.WsPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubmitQAQuestionUseCase {

    private final LiveStreamSessionRepository sessionRepository;
    private final QAQuestionRepository qaRepository;
    private final StreamAnalyticsRepository analyticsRepository; // ← THÊM
    private final WsPushPort wsPushPort;
    private final UserDisplayNameResolver nameResolver;

    public record Command(UUID sessionId, UUID candidateId, String question) {
    }

    @Transactional
    public void execute(Command cmd) {
        LiveStreamSession session = sessionRepository.findById(cmd.sessionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Phiên stream không tồn tại", "STREAM_NOT_FOUND"));

        if (!session.isLive()) {
            throw new BusinessRuleException(
                    "Chỉ có thể đặt câu hỏi khi phiên đang phát trực tiếp",
                    "STREAM_NOT_LIVE");
        }

        String candidateName = nameResolver.resolve(cmd.candidateId());

        QAQuestion question = QAQuestion.create(
                cmd.sessionId(), cmd.candidateId(), candidateName, cmd.question());

        QAQuestion saved = qaRepository.save(question);

        // ✅ Tăng qaQuestionCount
        try {
            StreamAnalytics analytics = analyticsRepository
                    .findBySessionId(cmd.sessionId())
                    .orElseGet(() -> StreamAnalytics.createFor(cmd.sessionId()));
            analytics.recordQaQuestion();
            analyticsRepository.save(analytics);
        } catch (Exception e) {
            log.warn("Failed to update qaQuestionCount for session {}", cmd.sessionId(), e);
        }

        wsPushPort.pushToTopic(
                streamTopic(cmd.sessionId(), "qa"),
                WsPayload.of(WsPayload.Type.STREAM_QA_QUESTION, QAQuestionPayload.from(saved)));
    }

    private static String streamTopic(UUID sessionId, String channel) {
        return "/topic/streams/" + sessionId + "/" + channel;
    }
}