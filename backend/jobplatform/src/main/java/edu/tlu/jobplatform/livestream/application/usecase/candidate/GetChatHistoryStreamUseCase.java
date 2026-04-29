// livestream/application/usecase/candidate/GetChatHistoryUseCase.java
package edu.tlu.jobplatform.livestream.application.usecase.candidate;

import edu.tlu.jobplatform.livestream.domain.model.ChatMessageStream;
import edu.tlu.jobplatform.livestream.domain.repository.ChatMessageStreamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetChatHistoryStreamUseCase {

    private static final int RECENT_LIMIT = 50;

    private final ChatMessageStreamRepository chatRepository;

    /**
     * Gọi khi candidate mới join — trả về 50 tin nhắn gần nhất để hiển thị context
     */
    public List<ChatMessageStream> execute(UUID sessionId) {
        return chatRepository.findRecentBySessionId(sessionId, RECENT_LIMIT);
    }
}