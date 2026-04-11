package edu.tlu.jobplatform.chatbot.infrastructure.persistence.repository;

import edu.tlu.jobplatform.chatbot.infrastructure.persistence.entity.ChatSessionJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ChatSessionJpaRepository
                extends JpaRepository<ChatSessionJpaEntity, UUID> {

        Page<ChatSessionJpaEntity> findByUserIdOrderByLastMessageAtDesc(
                        UUID userId, Pageable pageable);
}
