package edu.tlu.jobplatform.livestream.domain.repository;

import edu.tlu.jobplatform.livestream.domain.model.StreamRecording;
import edu.tlu.jobplatform.livestream.domain.model.vo.AISummaryStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StreamRecordingRepository {
    StreamRecording save(StreamRecording recording);

    Optional<StreamRecording> findBySessionId(UUID sessionId);

    List<StreamRecording> findByAiSummaryStatus(AISummaryStatus status);
}
