package edu.tlu.jobplatform.livestream.infrastructure.batch;

import edu.tlu.jobplatform.livestream.application.port.out.AITranscriptPort;
import edu.tlu.jobplatform.livestream.domain.model.StreamRecording;
import edu.tlu.jobplatform.livestream.domain.model.vo.AISummaryStatus;
import edu.tlu.jobplatform.livestream.domain.repository.StreamRecordingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class StreamAISummaryBatchJob {

    private final StreamRecordingRepository recordingRepository;
    private final AITranscriptPort aiTranscriptPort;

    /**
     * Chạy mỗi 2 phút, tìm các recording PENDING và xử lý.
     * Với local dev: dùng @Scheduled. Production: có thể dùng Spring Batch Job.
     */
    @Scheduled(fixedDelay = 120_000) // 2 phút
    public void processAllPending() {
        List<StreamRecording> pending = recordingRepository.findByAiSummaryStatus(AISummaryStatus.PENDING);
        if (pending.isEmpty())
            return;

        log.info("[AI Batch] Xử lý {} recording đang chờ AI summary", pending.size());
        pending.forEach(this::processSingle);
    }

    /**
     * Trigger ngay lập tức cho một recording cụ thể (dùng sau EndLiveStream).
     */
    @Async
    public void triggerForRecording(StreamRecording recording) {
        log.info("[AI Batch] Trigger async AI summary cho session: {}", recording.getSessionId());
        processSingle(recording);
    }

    // Private ─

    private void processSingle(StreamRecording recording) {
        try {
            recording.startProcessing();
            recordingRepository.save(recording);

            // 1. Whisper transcribe
            log.info("[AI Batch] Transcribing session {}...", recording.getSessionId());
            String transcript = aiTranscriptPort.transcribe(recording.getRecordingUrl());

            // 2. LLM summarize
            log.info("[AI Batch] Summarizing session {}...", recording.getSessionId());
            AITranscriptPort.AISummaryResult result = aiTranscriptPort.summarize(
                    transcript,
                    "Phiên tuyển dụng", // TODO: lấy title từ session
                    "JOB_FAIR" // TODO: lấy type từ session
            );

            // 3. Lưu kết quả
            recording.completeSummary(
                    transcript,
                    result.summary(),
                    result.topQuestions(),
                    result.keyTopics());
            recordingRepository.save(recording);

            log.info("[AI Batch] Hoàn tất AI summary cho session: {}", recording.getSessionId());

        } catch (Exception e) {
            log.error("[AI Batch] Lỗi xử lý session {}: {}", recording.getSessionId(), e.getMessage(), e);
            recording.markFailed();
            recordingRepository.save(recording);
        }
    }
}