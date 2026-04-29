package edu.tlu.jobplatform.websocket.application.port.out;

import edu.tlu.jobplatform.websocket.domain.model.WsPayload;

import java.util.UUID;

public interface WsPushPort {

    /** Gửi tới một user cụ thể (bất kể đang ở instance nào) */
    void pushToUser(UUID userId, WsPayload payload);

    /** Gửi tới tất cả participant trong một conversation */
    void pushToConversation(UUID conversationId, WsPayload payload);

    // ── Thêm mới cho livestream ──────────────────────────────
    /**
     * Broadcast tới tất cả subscriber của một topic tùy ý.
     * Dùng cho: /topic/streams/{sessionId}/chat|qa|poll|event
     */
    void pushToTopic(String topicDestination, WsPayload payload);
}