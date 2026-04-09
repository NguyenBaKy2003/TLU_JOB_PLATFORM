package edu.tlu.jobplatform.ai.infrastructure.openai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình Spring AI ChatClient.
 * API key lấy từ application.yml: spring.ai.openai.api-key
 */
@Configuration
public class SpringAiConfig {

    @Bean
    public ChatClient chatClient(OpenAiChatModel chatModel) {
        return ChatClient.builder(chatModel)
                .defaultSystem("""
                        Bạn là AI assistant chuyên phân tích CV tuyển dụng.
                        Luôn trả về JSON đúng format được yêu cầu.
                        Không thêm markdown, giải thích hay text ngoài JSON.
                        """)
                .build();
    }
}