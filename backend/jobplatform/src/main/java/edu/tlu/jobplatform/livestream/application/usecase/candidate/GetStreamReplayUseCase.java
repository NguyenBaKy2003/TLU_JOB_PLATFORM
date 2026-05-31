package edu.tlu.jobplatform.livestream.application.usecase.candidate;

import edu.tlu.jobplatform.livestream.domain.model.LiveStreamSession;
import edu.tlu.jobplatform.livestream.domain.model.StreamRecording;
import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.livestream.domain.repository.StreamRecordingRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

// ============================================================
// GetStreamReplayUseCase
// ============================================================
@Service
@RequiredArgsConstructor
public class GetStreamReplayUseCase {

        private final LiveStreamSessionRepository sessionRepository;
        private final StreamRecordingRepository recordingRepository;

        public record Result(
                        String videoUrl,
                        String aiSummary,
                        List<String> topQuestions,
                        List<String> keyTopics,
                        boolean hasApplyCTA,
                        List<UUID> spotlightedJobIds) {
        }

        public Result execute(UUID sessionId) {
                LiveStreamSession session = sessionRepository.findById(sessionId)
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiên stream"));

                StreamRecording recording = recordingRepository.findBySessionId(sessionId)
                                .orElseThrow(() -> new ResourceNotFoundException("Recording chưa sẵn sàng"));

                return new Result(
                                recording.getRecordingUrl(),
                                recording.getAiSummary(),
                                recording.getTopQuestions(),
                                recording.getKeyTopics(),
                                true,
                                List.of());
        }
}
