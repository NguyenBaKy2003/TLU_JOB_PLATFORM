package edu.tlu.jobplatform.livestream.infrastructure.persistence.entity;

import edu.tlu.jobplatform.livestream.domain.model.vo.StreamEventType;
import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

//  StreamEvent ─
@Entity
@Table(name = "stream_events", indexes = @Index(name = "idx_event_session", columnList = "session_id, occurred_at"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StreamEventJpaEntity extends BaseJpaEntity {

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "sender_id")
    private UUID senderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private StreamEventType type;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", columnDefinition = "jsonb")
    private String payload;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;
}
