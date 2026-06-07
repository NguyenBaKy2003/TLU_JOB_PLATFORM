package edu.tlu.jobplatform.livestream.domain.repository;

import edu.tlu.jobplatform.livestream.domain.model.LiveStreamSession;
import edu.tlu.jobplatform.livestream.domain.model.vo.SessionStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LiveStreamSessionRepository {

    LiveStreamSession save(LiveStreamSession session);

    Optional<LiveStreamSession> findById(UUID id);

    Optional<LiveStreamSession> findByIdForUpdate(UUID id);

    List<LiveStreamSession> findByCompanyId(UUID companyId);

    List<LiveStreamSession> findUpcoming(LocalDateTime from, LocalDateTime to);

    List<LiveStreamSession> findByStatus(SessionStatus status);

    void deleteById(UUID id);

    List<LiveStreamSession> findUpcomingAndLive(LocalDateTime from, LocalDateTime to);

    void updateViewerCount(UUID sessionId, int count);
}