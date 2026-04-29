package edu.tlu.jobplatform.websocket.domain.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Envelope chung cho mọi WS message.
 * Client parse type để biết cần xử lý gì.
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WsPayload {

    public enum Type {
        // Messaging
        NEW_MESSAGE,
        MESSAGE_READ,
        // Notifications
        NOTIFICATION,
        UNREAD_BADGE, // cập nhật số badge trên icon
        // System
        PING,
        ERROR,

        // ── Livestream (thêm mới) ──────────────────
        STREAM_CHAT_MESSAGE, // tin nhắn chat trong phiên
        STREAM_QA_QUESTION, // câu hỏi Q&A từ candidate → employer nhận
        STREAM_POLL_CREATED, // employer tạo poll mới
        STREAM_POLL_RESULT, // kết quả poll cập nhật realtime
        STREAM_EVENT // system event: viewer join/leave, session end...
    }

    private final Type type;
    private final Object data; // payload cụ thể, serialize thành JSON
    private final LocalDateTime timestamp;

    public static WsPayload of(Type type, Object data) {
        return WsPayload.builder()
                .type(type)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }
}