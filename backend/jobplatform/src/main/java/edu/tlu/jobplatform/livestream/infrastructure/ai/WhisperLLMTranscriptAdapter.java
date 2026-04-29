package edu.tlu.jobplatform.livestream.infrastructure.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.livestream.application.port.out.AITranscriptPort;
import lombok.extern.slf4j.Slf4j;

import org.springframework.ai.audio.transcription.AudioTranscriptionPrompt;
import org.springframework.ai.audio.transcription.AudioTranscriptionResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiAudioTranscriptionModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Adapter gọi OpenAI Whisper để transcribe audio,
 * sau đó dùng ChatClient (Spring AI 1.0.x) để tóm tắt.
 *
 * Spring AI 1.0.x breaking changes:
 * - OpenAiAudioTranscriptionClient → OpenAiAudioTranscriptionModel
 * - chatClient.call(prompt) → chatClient.prompt().user(text).call().content()
 *
 * Dùng constructor injection thủ công thay @RequiredArgsConstructor
 * vì @Qualifier không hoạt động với Lombok @RequiredArgsConstructor.
 */
@Component
@Slf4j
public class WhisperLLMTranscriptAdapter implements AITranscriptPort {

    private final OpenAiAudioTranscriptionModel transcriptionModel;
    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public WhisperLLMTranscriptAdapter(
            OpenAiAudioTranscriptionModel transcriptionModel,
            @Qualifier("streamChatClient") ChatClient chatClient,
            ObjectMapper objectMapper) {
        this.transcriptionModel = transcriptionModel;
        this.chatClient = chatClient;
        this.objectMapper = objectMapper;
    }

    // ─── AITranscriptPort impl ────────────────────────────────

    @Override
    public String transcribe(String recordingUrl) {
        log.info("[AI] Bắt đầu transcribe: {}", recordingUrl);
        try {
            UrlResource audioResource = new UrlResource(recordingUrl);
            AudioTranscriptionPrompt prompt = new AudioTranscriptionPrompt(audioResource);
            AudioTranscriptionResponse response = transcriptionModel.call(prompt);
            String transcript = response.getResult().getOutput();
            log.info("[AI] Transcribe hoàn tất, độ dài: {} ký tự", transcript.length());
            return transcript;
        } catch (Exception e) {
            log.error("[AI] Lỗi transcribe: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể transcribe recording", e);
        }
    }

    @Override
    public AISummaryResult summarize(String transcript, String sessionTitle, String sessionType) {
        log.info("[AI] Bắt đầu summarize phiên: {}", sessionTitle);
        try {
            String promptText = buildSummarizePrompt(transcript, sessionTitle, sessionType);

            // Spring AI 1.0.x fluent API
            String raw = chatClient
                    .prompt()
                    .user(promptText)
                    .call()
                    .content();

            return parseAISummaryResult(raw);
        } catch (Exception e) {
            log.error("[AI] Lỗi summarize: {}", e.getMessage(), e);
            return new AISummaryResult(
                    "Không thể tạo tóm tắt tự động cho phiên này.",
                    List.of(),
                    List.of());
        }
    }

    // ─── Private helpers ──────────────────────────────────────

    private String buildSummarizePrompt(String transcript, String title, String sessionType) {
        return """
                Bạn là trợ lý phân tích buổi tuyển dụng trực tuyến.

                Phiên: "%s" (loại: %s)

                Transcript:
                ---
                %s
                ---

                Hãy phân tích và trả về JSON với format sau (KHÔNG thêm markdown, chỉ JSON thuần):
                {
                  "summary": "Tóm tắt ngắn gọn 3-5 câu về nội dung buổi stream",
                  "topQuestions": ["câu hỏi 1", "câu hỏi 2", "câu hỏi 3"],
                  "keyTopics": ["chủ đề 1", "chủ đề 2", "chủ đề 3"]
                }

                Yêu cầu:
                - summary: tiếng Việt, súc tích, nêu được điểm nổi bật
                - topQuestions: tối đa 5 câu hỏi ứng viên hay hỏi nhất
                - keyTopics: tối đa 5 chủ đề chính được đề cập
                """.formatted(title, sessionType, truncate(transcript, 8000));
    }

    private AISummaryResult parseAISummaryResult(String raw) {
        try {
            String cleaned = raw.replaceAll("```json|```", "").trim();
            var node = objectMapper.readTree(cleaned);
            String summary = node.path("summary").asText("");
            List<String> topQuestions = objectMapper.convertValue(
                    node.path("topQuestions"),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
            List<String> keyTopics = objectMapper.convertValue(
                    node.path("keyTopics"),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
            return new AISummaryResult(summary, topQuestions, keyTopics);
        } catch (Exception e) {
            log.warn("[AI] Không parse được JSON từ LLM, dùng raw text làm summary");
            return new AISummaryResult(raw, List.of(), List.of());
        }
    }

    private String truncate(String text, int maxChars) {
        if (text == null)
            return "";
        return text.length() > maxChars ? text.substring(0, maxChars) + "..." : text;
    }
}