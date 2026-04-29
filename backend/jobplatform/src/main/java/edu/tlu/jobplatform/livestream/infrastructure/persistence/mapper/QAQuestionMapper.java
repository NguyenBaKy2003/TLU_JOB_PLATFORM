// livestream/infrastructure/persistence/mapper/QAQuestionMapper.java
package edu.tlu.jobplatform.livestream.infrastructure.persistence.mapper;

import edu.tlu.jobplatform.livestream.domain.model.QAQuestion;
import edu.tlu.jobplatform.livestream.infrastructure.persistence.entity.QAQuestionJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class QAQuestionMapper {

    public QAQuestionJpaEntity toEntity(QAQuestion domain) {
        return QAQuestionJpaEntity.of(
                domain.getId(),
                domain.getSessionId(),
                domain.getCandidateId(),
                domain.getCandidateName(),
                domain.getQuestion(),
                domain.isAnswered(),
                domain.getAskedAt());
    }

    public QAQuestion toDomain(QAQuestionJpaEntity entity) {
        return QAQuestion.restore(
                entity.getId(),
                entity.getSessionId(),
                entity.getCandidateId(),
                entity.getCandidateName(),
                entity.getQuestion(),
                entity.isAnswered(),
                entity.getAskedAt());
    }
}