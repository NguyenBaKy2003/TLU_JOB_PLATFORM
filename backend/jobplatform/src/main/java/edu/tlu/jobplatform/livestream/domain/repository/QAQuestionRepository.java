// livestream/domain/repository/QAQuestionRepository.java
package edu.tlu.jobplatform.livestream.domain.repository;

import edu.tlu.jobplatform.livestream.domain.model.QAQuestion;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QAQuestionRepository {
    QAQuestion save(QAQuestion question);

    Optional<QAQuestion> findById(UUID id);

    List<QAQuestion> findBySessionId(UUID sessionId);

    List<QAQuestion> findUnansweredBySessionId(UUID sessionId);
}