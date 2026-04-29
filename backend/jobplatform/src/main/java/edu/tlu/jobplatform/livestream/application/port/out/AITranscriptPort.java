package edu.tlu.jobplatform.livestream.application.port.out;

import java.util.List;

public interface AITranscriptPort {

    record AISummaryResult(
            String summary,
            List<String> topQuestions,
            List<String> keyTopics) {
    }

    /**
     * Transcribe audio/video file thành text (dùng Whisper API).
     */
    String transcribe(String recordingUrl);

    /**
     * Tóm tắt transcript thành summary có cấu trúc.
     */
    AISummaryResult summarize(String transcript, String sessionTitle, String sessionType);
}