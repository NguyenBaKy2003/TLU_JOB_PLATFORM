// livestream/infrastructure/persistence/entity/ChatMessageStreamJpaEntity.java
package edu.tlu.jobplatform.livestream.infrastructure.persistence.entity;

import edu.tlu.jobplatform.livestream.domain.model.ChatMessageStream.SenderRole;
import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stream_chat_messages", indexes = {
        @Index(name = "idx_chat_session_id", columnList = "session_id"),
        @Index(name = "idx_chat_sent_at", columnList = "session_id, sent_at DESC")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatMessageStreamJpaEntity extends BaseJpaEntity {

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "sender_id", nullable = false)
    private UUID senderId;

    @Column(name = "sender_name", nullable = false, length = 150)
    private String senderName;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender_role", nullable = false, length = 20)
    private SenderRole senderRole;

    @Column(name = "content", nullable = false, length = 300)
    private String content;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    // ── Static factory — chỉ dùng trong Mapper ─
    public static ChatMessageStreamJpaEntity of(
            UUID id,
            UUID sessionId,
            UUID senderId,
            String senderName,
            SenderRole senderRole,
            String content,
            LocalDateTime sentAt) {

        ChatMessageStreamJpaEntity e = new ChatMessageStreamJpaEntity();
        e.setId(id); // setter kế thừa từ BaseJpaEntity
        e.sessionId = sessionId;
        e.senderId = senderId;
        e.senderName = senderName;
        e.senderRole = senderRole;
        e.content = content;
        e.sentAt = sentAt;
        return e;
    }
}