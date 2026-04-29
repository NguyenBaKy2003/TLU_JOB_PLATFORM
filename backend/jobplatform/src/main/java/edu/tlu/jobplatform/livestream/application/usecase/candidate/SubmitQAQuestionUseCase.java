// livestream/application/usecase/candidate/SubmitQAQuestionUseCase.java
package edu.tlu.jobplatform.livestream.application.usecase.candidate;

import edu.tlu.jobplatform.livestream.domain.model.LiveStreamSession;
import edu.tlu.jobplatform.livestream.domain.model.QAQuestion;
import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.livestream.domain.repository.QAQuestionRepository;
import edu.tlu.jobplatform.livestream.presentation.dto.ws.payload.QAQuestionPayload;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.websocket.application.port.out.WsPushPort;
import edu.tlu.jobplatform.websocket.domain.model.WsPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubmitQAQuestionUseCase {

    private final LiveStreamSessionRepository sessionRepository;
    private final QAQuestionRepository qaRepository;
    private final WsPushPort wsPushPort;
    private final UserDisplayNameResolver nameResolver; // xem mục 4

    public record Command(UUID sessionId, UUID candidateId, String question) {
    }

    @Transactional
    public void execute(Command cmd) {
        // 1. Kiểm tra session tồn tại và đang LIVE
        LiveStreamSession session = sessionRepository.findById(cmd.sessionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Phiên stream không tồn tại", "STREAM_NOT_FOUND"));

        if (!session.isLive()) {
            throw new BusinessRuleException(
                    "Chỉ có thể đặt câu hỏi khi phiên đang phát trực tiếp",
                    "STREAM_NOT_LIVE");
        }

        // 2. Lấy tên hiển thị — validation trong domain model
        String candidateName = nameResolver.resolve(cmd.candidateId());

        // 3. Tạo — validation nằm trong domain
        QAQuestion question = QAQuestion.create(
                cmd.sessionId(), cmd.candidateId(), candidateName, cmd.question());

        QAQuestion saved = qaRepository.save(question);

        // 4. Broadcast tới employer (subscribe /topic/streams/{id}/qa)
        wsPushPort.pushToTopic(
                streamTopic(cmd.sessionId(), "qa"),
                WsPayload.of(WsPayload.Type.STREAM_QA_QUESTION, QAQuestionPayload.from(saved)));
    }

    private static String streamTopic(UUID sessionId, String channel) {
        return "/topic/streams/" + sessionId + "/" + channel;
    }
}