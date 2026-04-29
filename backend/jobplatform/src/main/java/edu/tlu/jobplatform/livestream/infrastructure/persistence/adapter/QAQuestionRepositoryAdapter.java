// livestream/infrastructure/persistence/adapter/QAQuestionRepositoryAdapter.java
package edu.tlu.jobplatform.livestream.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.livestream.domain.model.QAQuestion;
import edu.tlu.jobplatform.livestream.domain.repository.QAQuestionRepository;
import edu.tlu.jobplatform.livestream.infrastructure.persistence.mapper.QAQuestionMapper;
import edu.tlu.jobplatform.livestream.infrastructure.persistence.repository.QAQuestionJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class QAQuestionRepositoryAdapter implements QAQuestionRepository {

    private final QAQuestionJpaRepository jpaRepository;
    private final QAQuestionMapper mapper;

    @Override
    public QAQuestion save(QAQuestion question) {
        return mapper.toDomain(
                jpaRepository.save(mapper.toEntity(question)));
    }

    @Override
    public Optional<QAQuestion> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<QAQuestion> findBySessionId(UUID sessionId) {
        return jpaRepository
                .findBySessionIdOrderByAskedAtAsc(sessionId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<QAQuestion> findUnansweredBySessionId(UUID sessionId) {
        return jpaRepository
                .findBySessionIdAndAnsweredFalseOrderByAskedAtAsc(sessionId)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }
}