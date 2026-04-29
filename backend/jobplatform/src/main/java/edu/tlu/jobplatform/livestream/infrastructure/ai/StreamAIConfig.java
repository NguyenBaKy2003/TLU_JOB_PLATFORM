package edu.tlu.jobplatform.livestream.infrastructure.ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Config bean riêng cho Livestream AI.
 *
 * Spring AI 1.0.x: ChatClient KHÔNG inject trực tiếp được.
 * Phải dùng ChatClient.Builder để tạo instance.
 *
 * Nếu project đã có ChatClient bean ở chỗ khác (ví dụ ai domain),
 * đổi tên method thành streamChatClient() và
 * thêm @Qualifier("streamChatClient")
 * vào WhisperLLMTranscriptAdapter.
 */
@Configuration
public class StreamAIConfig {

    @Bean
    public ChatClient streamChatClient(ChatClient.Builder builder) {
        return builder
                .defaultSystem(
                        "Bạn là trợ lý phân tích nội dung buổi tuyển dụng trực tuyến. Chỉ trả về JSON thuần, không thêm markdown.")
                .build();
    }
}