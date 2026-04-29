// livestream/infrastructure/persistence/repository/ChatMessageStreamJpaRepository.java
package edu.tlu.jobplatform.livestream.infrastructure.persistence.repository;

import edu.tlu.jobplatform.livestream.infrastructure.persistence.entity.ChatMessageStreamJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ChatMessageStreamJpaRepository
        extends JpaRepository<ChatMessageStreamJpaEntity, UUID> {

    /**
     * Lấy N tin nhắn gần nhất của phiên, sắp xếp tăng dần để hiển thị đúng chiều.
     * Dùng subquery để LIMIT trước rồi ORDER lại.
     */
    @Query(value = """
            SELECT * FROM (
                SELECT * FROM stream_chat_messages
                WHERE session_id = :sessionId
                ORDER BY sent_at DESC
                LIMIT :limit
            ) sub
            ORDER BY sub.sent_at ASC
            """, nativeQuery = true)
    List<ChatMessageStreamJpaEntity> findRecentBySessionId(
            @Param("sessionId") UUID sessionId,
            @Param("limit") int limit);
}