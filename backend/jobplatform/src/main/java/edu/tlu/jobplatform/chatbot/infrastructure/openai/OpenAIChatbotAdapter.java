package edu.tlu.jobplatform.chatbot.infrastructure.openai;

import edu.tlu.jobplatform.chatbot.domain.model.ChatMessage;
import edu.tlu.jobplatform.chatbot.domain.model.MessageRole;
import edu.tlu.jobplatform.chatbot.domain.port.ChatbotPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Chatbot adapter dùng @Primary chatClient (temperature 0.7).
 * Không dùng @Qualifier vì đây là primary bean.
 */
@Slf4j
@Component
@Profile("!test")
public class OpenAIChatbotAdapter implements ChatbotPort {

    private final ChatClient chatClient;

    @Value("classpath:prompts/career-advisor.st")
    private Resource systemPromptResource;

    private static final int MAX_HISTORY = 20;

    // Inject @Primary chatClient (không cần @Qualifier)
    public OpenAIChatbotAdapter(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @Override
    public String chat(List<ChatMessage> messages) {
        try {
            String systemPrompt = systemPromptResource
                .getContentAsString(StandardCharsets.UTF_8);

            List<Message> aiMessages = new ArrayList<>();
            aiMessages.add(new SystemMessage(systemPrompt));

            // Sliding window — giữ N tin nhắn gần nhất
            List<ChatMessage> window = messages.size() > MAX_HISTORY
                ? messages.subList(messages.size() - MAX_HISTORY, messages.size())
                : messages;

            for (ChatMessage msg : window) {
                if (msg.getRole() == MessageRole.USER)
                    aiMessages.add(new UserMessage(msg.getContent()));
                else if (msg.getRole() == MessageRole.ASSISTANT)
                    aiMessages.add(new AssistantMessage(msg.getContent()));
            }

            String reply = chatClient.prompt(new Prompt(aiMessages)).call().content();
            log.debug("Chatbot replied: {} chars", reply != null ? reply.length() : 0);
            return reply;

        } catch (IOException e) {
            log.error("Failed to load system prompt: {}", e.getMessage());
            return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.";
        } catch (Exception e) {
            log.error("Chatbot error: {}", e.getMessage());
            return "Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại.";
        }
    }
}
