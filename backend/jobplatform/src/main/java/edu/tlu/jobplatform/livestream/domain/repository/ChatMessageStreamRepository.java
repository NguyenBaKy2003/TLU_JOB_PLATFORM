// livestream/domain/repository/ChatMessageRepository.java
package edu.tlu.jobplatform.livestream.domain.repository;

import edu.tlu.jobplatform.livestream.domain.model.ChatMessageStream;

import java.util.List;
import java.util.UUID;

public interface ChatMessageStreamRepository {
    ChatMessageStream save(ChatMessageStream message);

    /** Lấy N tin nhắn gần nhất — dùng khi candidate mới join */
    List<ChatMessageStream> findRecentBySessionId(UUID sessionId, int limit);
}