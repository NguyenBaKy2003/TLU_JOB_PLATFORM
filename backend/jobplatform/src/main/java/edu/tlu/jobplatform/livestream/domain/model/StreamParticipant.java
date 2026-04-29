package edu.tlu.jobplatform.livestream.domain.model;

import edu.tlu.jobplatform.livestream.domain.model.vo.ParticipantRole;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
public class StreamParticipant {

    private final UUID id;
    private final UUID sessionId;
    private final UUID userId;
    private final ParticipantRole role;
    private final LocalDateTime joinedAt;
    private LocalDateTime leftAt;

    public static StreamParticipant join(UUID sessionId, UUID userId, ParticipantRole role) {
        return new StreamParticipant(UUID.randomUUID(), sessionId, userId, role, LocalDateTime.now(), null);
    }

    private StreamParticipant(UUID id, UUID sessionId, UUID userId,
            ParticipantRole role, LocalDateTime joinedAt, LocalDateTime leftAt) {
        this.id = id;
        this.sessionId = sessionId;
        this.userId = userId;
        this.role = role;
        this.joinedAt = joinedAt;
        this.leftAt = leftAt;
    }

    public void leave() {
        this.leftAt = LocalDateTime.now();
    }

    public boolean isActive() {
        return leftAt == null;
    }

    public boolean canPublish() {
        return role == ParticipantRole.HOST
                || role == ParticipantRole.CO_HOST
                || role == ParticipantRole.SPEAKER;
    }
}