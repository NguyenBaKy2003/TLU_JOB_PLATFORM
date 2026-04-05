package edu.tlu.jobplatform.message.application.usecase;

import edu.tlu.jobplatform.message.domain.model.Conversation;
import edu.tlu.jobplatform.message.domain.repository.ConversationRepository;
import edu.tlu.jobplatform.message.domain.repository.MessageRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MarkReadUseCase {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    @Transactional
    public void execute(UUID conversationId, UUID userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .filter(c -> c.isParticipant(userId))
                .orElseThrow(() -> new BusinessRuleException(
                        "Không có quyền truy cập cuộc trò chuyện này.", "ACCESS_DENIED"));

        // Đánh dấu tất cả message chưa đọc là đã đọc
        int count = messageRepository.markAllReadInConversation(conversationId, userId);

        // Reset unread counter trên conversation
        conversation.markReadBy(userId);
        conversationRepository.save(conversation);

        log.debug("Marked read: conversationId={} userId={} count={}", conversationId, userId, count);
    }
}