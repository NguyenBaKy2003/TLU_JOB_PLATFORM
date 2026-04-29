package edu.tlu.jobplatform.livestream.infrastructure.persistence.repository;

import edu.tlu.jobplatform.livestream.domain.model.vo.AISummaryStatus;
import edu.tlu.jobplatform.livestream.infrastructure.persistence.entity.StreamRecordingJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StreamRecordingJpaRepository extends JpaRepository<StreamRecordingJpaEntity, UUID> {

    Optional<StreamRecordingJpaEntity> findBySessionId(UUID sessionId);

    List<StreamRecordingJpaEntity> findByAiSummaryStatus(AISummaryStatus status);
}
