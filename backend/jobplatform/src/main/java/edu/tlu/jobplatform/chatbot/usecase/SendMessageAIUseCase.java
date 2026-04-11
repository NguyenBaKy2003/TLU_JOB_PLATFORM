package edu.tlu.jobplatform.chatbot.usecase;

import edu.tlu.jobplatform.chatbot.domain.model.ChatMessage;
import edu.tlu.jobplatform.chatbot.domain.model.ChatSession;
import edu.tlu.jobplatform.chatbot.domain.port.ChatSessionRepository;
import edu.tlu.jobplatform.chatbot.domain.port.ChatbotPort;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * UseCase: Gửi tin nhắn và nhận phản hồi từ AI Career Advisor.
 *
 * Flow:
 * 1. Load session (hoặc tạo mới nếu sessionId null)
 * 2. Thêm tin nhắn user vào session
 * 3. Gọi AI với toàn bộ conversation history
 * 4. Thêm reply AI vào session
 * 5. Lưu session
 * 6. Trả về reply
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SendMessageAIUseCase {

    private final ChatSessionRepository sessionRepo;
    private final ChatbotPort chatbotPort;

    private static final int MAX_MESSAGE_LENGTH = 2000;

    @Transactional
    public Result execute(Command cmd) {

        // Validate input
        if (cmd.content() == null || cmd.content().isBlank())
            throw new BusinessRuleException("Nội dung tin nhắn không được để trống.", "EMPTY_MESSAGE");

        if (cmd.content().length() > MAX_MESSAGE_LENGTH)
            throw new BusinessRuleException(
                    "Tin nhắn quá dài (tối đa " + MAX_MESSAGE_LENGTH + " ký tự).", "MESSAGE_TOO_LONG");

        // Load hoặc tạo mới session
        ChatSession session;
        if (cmd.sessionId() != null) {
            session = sessionRepo.findById(cmd.sessionId())
                    .orElseThrow(() -> ResourceNotFoundException.of("ChatSession", cmd.sessionId()));

            // Kiểm tra session thuộc về user
            if (!session.getUserId().equals(cmd.userId()))
                throw new BusinessRuleException("Phiên chat không hợp lệ.", "FORBIDDEN");
        } else {
            session = ChatSession.builder()
                    .id(UUID.randomUUID())
                    .userId(cmd.userId())
                    .createdAt(LocalDateTime.now())
                    .build();
        }

        // Thêm tin nhắn user
        ChatMessage userMsg = ChatMessage.userMessage(session.getId(), cmd.content());
        session.addMessage(userMsg);

        // Gọi AI với conversation history
        String aiReply = chatbotPort.chat(session.getMessages());

        // Thêm reply AI
        ChatMessage assistantMsg = ChatMessage.assistantMessage(session.getId(), aiReply);
        session.addMessage(assistantMsg);

        // Lưu session
        ChatSession saved = sessionRepo.save(session);

        log.debug("Chat message processed: sessionId={} userId={}", saved.getId(), cmd.userId());

        return new Result(saved.getId(), assistantMsg);
    }

    public record Command(
            UUID userId,
            UUID sessionId, // null = tạo session mới
            String content) {
    }

    public record Result(
            UUID sessionId,
            ChatMessage reply) {
    }
}
