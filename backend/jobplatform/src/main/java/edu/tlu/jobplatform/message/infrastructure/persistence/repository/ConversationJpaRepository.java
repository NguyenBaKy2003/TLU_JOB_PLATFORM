package edu.tlu.jobplatform.message.infrastructure.persistence.repository;

import edu.tlu.jobplatform.message.infrastructure.persistence.entity.ConversationJpaEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationJpaRepository extends JpaRepository<ConversationJpaEntity, UUID> {

   @Query("""
         SELECT c FROM ConversationJpaEntity c
         WHERE (c.participantA = :a AND c.participantB = :b)
            OR (c.participantA = :b AND c.participantB = :a)
         """)
   Optional<ConversationJpaEntity> findByParticipants(UUID a, UUID b);

   @Query("""
         SELECT c FROM ConversationJpaEntity c
         WHERE c.participantA = :userId OR c.participantB = :userId
         ORDER BY c.lastMessageAt DESC NULLS LAST
         """)
   List<ConversationJpaEntity> findByParticipant(UUID userId, Pageable pageable);

   @Query("""
         SELECT COUNT(c) FROM ConversationJpaEntity c
         WHERE (c.participantA = :userId AND c.unreadCountA > 0)
            OR (c.participantB = :userId AND c.unreadCountB > 0)
         """)
   int countUnreadByParticipant(UUID userId);
}