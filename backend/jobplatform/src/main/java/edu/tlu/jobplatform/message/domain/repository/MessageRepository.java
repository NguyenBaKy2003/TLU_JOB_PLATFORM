package edu.tlu.jobplatform.message.domain.repository;

import edu.tlu.jobplatform.message.domain.model.Message;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MessageRepository {

    Message save(Message message);

    Optional<Message> findById(UUID id);

    /**
     * Lấy messages trong conversation, sort theo createdAt ASC (cũ trước mới sau)
     */
    List<Message> findByConversationId(UUID conversationId, int page, int size);

    /** Đánh dấu tất cả message chưa đọc trong conversation là đã đọc */
    int markAllReadInConversation(UUID conversationId, UUID readerId);
}