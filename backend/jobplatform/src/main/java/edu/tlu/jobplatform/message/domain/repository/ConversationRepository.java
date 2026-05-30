package edu.tlu.jobplatform.message.domain.repository;

import edu.tlu.jobplatform.message.domain.model.Conversation;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository {

    Conversation save(Conversation conversation);

    Optional<Conversation> findById(UUID id);

    // FIX: bỏ jobPostId — 1 conversation duy nhất / cặp người dùng
    Optional<Conversation> findByParticipants(UUID participantA, UUID participantB);

    /** Inbox — lấy tất cả conversation của user, sort theo lastMessageAt DESC */
    List<Conversation> findByParticipant(UUID userId, int page, int size);

    /** Tổng số unread conversations của user */
    int countUnreadByParticipant(UUID userId);
}