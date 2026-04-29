// livestream/infrastructure/persistence/entity/QAQuestionJpaEntity.java
package edu.tlu.jobplatform.livestream.infrastructure.persistence.entity;

import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stream_qa_questions", indexes = {
        @Index(name = "idx_qa_session_id", columnList = "session_id"),
        @Index(name = "idx_qa_unanswered", columnList = "session_id, answered")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QAQuestionJpaEntity extends BaseJpaEntity {

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "candidate_id", nullable = false)
    private UUID candidateId;

    @Column(name = "candidate_name", nullable = false, length = 150)
    private String candidateName;

    @Column(name = "question", nullable = false, length = 500)
    private String question;

    @Column(name = "answered", nullable = false)
    private boolean answered;

    @Column(name = "asked_at", nullable = false)
    private LocalDateTime askedAt;

    public static QAQuestionJpaEntity of(
            UUID id,
            UUID sessionId,
            UUID candidateId,
            String candidateName,
            String question,
            boolean answered,
            LocalDateTime askedAt) {

        QAQuestionJpaEntity e = new QAQuestionJpaEntity();
        e.setId(id);
        e.sessionId = sessionId;
        e.candidateId = candidateId;
        e.candidateName = candidateName;
        e.question = question;
        e.answered = answered;
        e.askedAt = askedAt;
        return e;
    }

    /** Dùng khi markAnswered() — cập nhật field trực tiếp trước khi save */
    public void markAnswered() {
        this.answered = true;
    }
}