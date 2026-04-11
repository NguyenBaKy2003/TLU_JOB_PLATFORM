package edu.tlu.jobplatform.chatbot.domain.port;

import edu.tlu.jobplatform.chatbot.domain.model.ChatMessage;

import java.util.List;

/**
 * Output Port: Gửi conversation đến AI và nhận reply.
 *
 * Implementation: OpenAIChatbotAdapter (Spring AI)
 */
public interface ChatbotPort {

    /**
     * Gửi toàn bộ conversation history để AI trả lời.
     *
     * @param messages  Lịch sử chat (bao gồm tin nhắn mới nhất của user)
     * @return          Reply từ AI assistant
     */
    String chat(List<ChatMessage> messages);
}
