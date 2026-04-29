package edu.tlu.jobplatform.livestream.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.livestream.domain.model.*;
import edu.tlu.jobplatform.livestream.domain.model.vo.AISummaryStatus;
import edu.tlu.jobplatform.livestream.domain.repository.*;
import edu.tlu.jobplatform.livestream.infrastructure.persistence.mapper.LiveStreamMapper;
import edu.tlu.jobplatform.livestream.infrastructure.persistence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

// ─── StreamRecording Adapter ──────────────────────────────────
@Component
@RequiredArgsConstructor
public class StreamRecordingRepositoryAdapter implements StreamRecordingRepository {

    private final StreamRecordingJpaRepository jpaRepository;
    private final LiveStreamMapper mapper;

    @Override
    public StreamRecording save(StreamRecording recording) {
        var saved = jpaRepository.save(mapper.toJpa(recording));
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<StreamRecording> findBySessionId(UUID sessionId) {
        return jpaRepository.findBySessionId(sessionId).map(mapper::toDomain);
    }

    @Override
    public List<StreamRecording> findByAiSummaryStatus(AISummaryStatus status) {
        return jpaRepository.findByAiSummaryStatus(status)
                .stream().map(mapper::toDomain).toList();
    }
}
