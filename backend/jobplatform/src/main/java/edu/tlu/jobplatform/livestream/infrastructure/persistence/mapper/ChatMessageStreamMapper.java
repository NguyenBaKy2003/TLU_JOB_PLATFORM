// livestream/infrastructure/persistence/mapper/ChatMessageStreamMapper.java
package edu.tlu.jobplatform.livestream.infrastructure.persistence.mapper;

import edu.tlu.jobplatform.livestream.domain.model.ChatMessageStream;
import edu.tlu.jobplatform.livestream.infrastructure.persistence.entity.ChatMessageStreamJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class ChatMessageStreamMapper {

    public ChatMessageStreamJpaEntity toEntity(ChatMessageStream domain) {
        return ChatMessageStreamJpaEntity.of(
                domain.getId(),
                domain.getSessionId(),
                domain.getSenderId(),
                domain.getSenderName(),
                domain.getSenderRole(),
                domain.getContent(),
                domain.getSentAt());
    }

    public ChatMessageStream toDomain(ChatMessageStreamJpaEntity entity) {
        return ChatMessageStream.restore(
                entity.getId(),
                entity.getSessionId(),
                entity.getSenderId(),
                entity.getSenderName(),
                entity.getSenderRole(),
                entity.getContent(),
                entity.getSentAt());
    }
}