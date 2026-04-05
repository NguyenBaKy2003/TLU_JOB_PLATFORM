package edu.tlu.jobplatform.message.domain.repository;

import edu.tlu.jobplatform.message.domain.model.Conversation;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository {

    Conversation save(Conversation conversation);

    Optional<Conversation> findById(UUID id);

    /** Kiểm tra conversation đã tồn tại giữa 2 người về 1 job chưa */
    Optional<Conversation> findByParticipantsAndJobPost(UUID participantA,
            UUID participantB,
            UUID jobPostId);

    /** Inbox — lấy tất cả conversation của user, sort theo lastMessageAt DESC */
    List<Conversation> findByParticipant(UUID userId, int page, int size);

    /** Tổng số unread conversations của user */
    int countUnreadByParticipant(UUID userId);
}