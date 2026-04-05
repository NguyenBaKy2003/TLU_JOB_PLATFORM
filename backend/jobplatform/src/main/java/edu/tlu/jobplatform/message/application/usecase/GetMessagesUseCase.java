package edu.tlu.jobplatform.message.application.usecase;

import edu.tlu.jobplatform.message.domain.model.Message;
import edu.tlu.jobplatform.message.domain.repository.ConversationRepository;
import edu.tlu.jobplatform.message.domain.repository.MessageRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/** Lấy thread messages trong một conversation */
@Service
@RequiredArgsConstructor
public class GetMessagesUseCase {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    @Transactional(readOnly = true)
    public List<Message> execute(UUID conversationId, UUID requesterId, int page, int size) {
        // Kiểm tra requesterId có phải participant không
        conversationRepository.findById(conversationId)
                .filter(c -> c.isParticipant(requesterId))
                .orElseThrow(() -> new BusinessRuleException(
                        "Không có quyền truy cập cuộc trò chuyện này.", "ACCESS_DENIED"));

        return messageRepository.findByConversationId(conversationId, page, size);
    }
}