// livestream/application/usecase/candidate/SendChatMessageUseCase.java
package edu.tlu.jobplatform.livestream.application.usecase.candidate;

import edu.tlu.jobplatform.livestream.domain.model.ChatMessageStream;
import edu.tlu.jobplatform.livestream.domain.model.ChatMessageStream.SenderRole;
import edu.tlu.jobplatform.livestream.domain.model.LiveStreamSession;
import edu.tlu.jobplatform.livestream.domain.repository.ChatMessageStreamRepository;
import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.livestream.presentation.dto.ws.payload.ChatMessagePayload;
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
public class SendChatMessageUseCase {

    private final LiveStreamSessionRepository sessionRepository;
    private final ChatMessageStreamRepository chatRepository;
    private final WsPushPort wsPushPort;
    private final UserDisplayNameResolver nameResolver;

    public record Command(UUID sessionId, UUID senderId, SenderRole role, String content) {
    }

    @Transactional
    public ChatMessageStream execute(Command cmd) {
        // 1. Kiểm tra session
        LiveStreamSession session = sessionRepository.findById(cmd.sessionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Phiên stream không tồn tại", "STREAM_NOT_FOUND"));

        if (!session.isLive()) {
            throw new BusinessRuleException(
                    "Chat chỉ khả dụng khi phiên đang LIVE", "STREAM_NOT_LIVE");
        }

        // 2. Tên người gửi
        String senderName = nameResolver.resolve(cmd.senderId());

        // 3. Tạo — validation content trong domain model
        ChatMessageStream message = ChatMessageStream.create(
                cmd.sessionId(), cmd.senderId(), senderName, cmd.role(), cmd.content());

        ChatMessageStream saved = chatRepository.save(message);

        // 4. Broadcast tới tất cả viewer
        wsPushPort.pushToTopic(
                streamTopic(cmd.sessionId(), "chat"),
                WsPayload.of(WsPayload.Type.STREAM_CHAT_MESSAGE, ChatMessagePayload.from(saved)));

        return saved;
    }

    private static String streamTopic(UUID sessionId, String channel) {
        return "/topic/streams/" + sessionId + "/" + channel;
    }
}