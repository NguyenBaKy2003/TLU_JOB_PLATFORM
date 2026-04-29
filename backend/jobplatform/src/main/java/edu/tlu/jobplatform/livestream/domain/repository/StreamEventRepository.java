package edu.tlu.jobplatform.livestream.domain.repository;

import edu.tlu.jobplatform.livestream.domain.model.StreamEvent;

import java.util.List;
import java.util.UUID;

public interface StreamEventRepository {
    StreamEvent save(StreamEvent event);

    List<StreamEvent> findBySessionId(UUID sessionId);
}
