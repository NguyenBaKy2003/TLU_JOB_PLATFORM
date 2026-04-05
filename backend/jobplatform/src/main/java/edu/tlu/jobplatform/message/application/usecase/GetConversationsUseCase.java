package edu.tlu.jobplatform.message.application.usecase;

import edu.tlu.jobplatform.message.domain.model.Conversation;
import edu.tlu.jobplatform.message.domain.repository.ConversationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/** Lấy inbox (danh sách conversations) của user */
@Service
@RequiredArgsConstructor
public class GetConversationsUseCase {

    private final ConversationRepository conversationRepository;

    @Transactional(readOnly = true)
    public Result execute(UUID userId, int page, int size) {
        List<Conversation> conversations = conversationRepository.findByParticipant(userId, page, size);
        int totalUnread = conversationRepository.countUnreadByParticipant(userId);
        return new Result(conversations, totalUnread);
    }

    public record Result(List<Conversation> conversations, int totalUnread) {
    }
}