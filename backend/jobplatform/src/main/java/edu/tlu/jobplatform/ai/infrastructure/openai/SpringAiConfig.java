package edu.tlu.jobplatform.ai.infrastructure.openai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.ResponseFormat;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class SpringAiConfig {

        @Value("${spring.ai.openai.chat.options.model:llama-3.3-70b-versatile}")
        private String defaultModel;

        @Bean("jsonChatClient")
        public ChatClient jsonChatClient(OpenAiChatModel chatModel) {
                return ChatClient.builder(chatModel)
                                .defaultOptions(OpenAiChatOptions.builder()
                                                .model(defaultModel) // Dùng model từ config
                                                .temperature(0.1)
                                                .responseFormat(ResponseFormat.builder()
                                                                .type(ResponseFormat.Type.JSON_OBJECT)
                                                                .build())
                                                .build())
                                .defaultSystem("""
                                                Bạn là AI assistant chuyên phân tích tuyển dụng.
                                                QUAN TRỌNG: Chỉ trả về JSON hợp lệ, không thêm bất kỳ text nào khác.
                                                Không dùng markdown, không giải thích, chỉ JSON thuần.
                                                """)
                                .build();
        }

        @Bean
        @Primary
        public ChatClient chatClient(OpenAiChatModel chatModel) {
                return ChatClient.builder(chatModel)
                                .defaultOptions(OpenAiChatOptions.builder()
                                                .model(defaultModel)
                                                .temperature(0.7)
                                                .maxTokens(1000)
                                                .build())
                                .build();
        }
}