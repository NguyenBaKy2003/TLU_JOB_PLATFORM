// livestream/infrastructure/persistence/repository/QAQuestionJpaRepository.java
package edu.tlu.jobplatform.livestream.infrastructure.persistence.repository;

import edu.tlu.jobplatform.livestream.infrastructure.persistence.entity.QAQuestionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QAQuestionJpaRepository
        extends JpaRepository<QAQuestionJpaEntity, UUID> {

    List<QAQuestionJpaEntity> findBySessionIdOrderByAskedAtAsc(UUID sessionId);

    List<QAQuestionJpaEntity> findBySessionIdAndAnsweredFalseOrderByAskedAtAsc(UUID sessionId);
}