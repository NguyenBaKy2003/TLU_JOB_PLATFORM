package edu.tlu.jobplatform.message.infrastructure.persistence.repository;

import edu.tlu.jobplatform.message.infrastructure.persistence.entity.MessageJpaEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface MessageJpaRepository extends JpaRepository<MessageJpaEntity, UUID> {

    List<MessageJpaEntity> findByConversationIdOrderByCreatedAtAsc(
            UUID conversationId, Pageable pageable);

    @Modifying
    @Query("""
            UPDATE MessageJpaEntity m
            SET m.read = true, m.readAt = CURRENT_TIMESTAMP
            WHERE m.conversationId = :conversationId
              AND m.senderId != :readerId
              AND m.read = false
            """)
    int markAllReadInConversation(UUID conversationId, UUID readerId);
}