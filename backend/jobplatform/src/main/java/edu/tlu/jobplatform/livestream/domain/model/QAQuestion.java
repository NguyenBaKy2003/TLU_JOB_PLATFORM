// livestream/domain/model/QAQuestion.java
package edu.tlu.jobplatform.livestream.domain.model;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
public class QAQuestion {

    private final UUID id;
    private final UUID sessionId;
    private final UUID candidateId;
    private final String candidateName;
    private final String question;
    private boolean answered;
    private final LocalDateTime askedAt;

    private QAQuestion(UUID id, UUID sessionId, UUID candidateId,
            String candidateName, String question) {
        this.id = id;
        this.sessionId = sessionId;
        this.candidateId = candidateId;
        this.candidateName = candidateName;
        this.question = question;
        this.answered = false;
        this.askedAt = LocalDateTime.now();
    }

    public static QAQuestion create(UUID sessionId, UUID candidateId,
            String candidateName, String question) {
        if (question == null || question.isBlank()) {
            throw new BusinessRuleException(
                    "Câu hỏi không được để trống", "QA_QUESTION_BLANK");
        }
        if (question.length() > 500) {
            throw new BusinessRuleException(
                    "Câu hỏi không được vượt quá 500 ký tự", "QA_QUESTION_TOO_LONG");
        }
        return new QAQuestion(UUID.randomUUID(), sessionId, candidateId, candidateName, question);
    }

    /** Dùng khi restore từ DB */
    public static QAQuestion restore(UUID id, UUID sessionId, UUID candidateId,
            String candidateName, String question,
            boolean answered, LocalDateTime askedAt) {
        QAQuestion q = new QAQuestion(id, sessionId, candidateId, candidateName, question);
        q.answered = answered;
        // askedAt là final — cần field riêng; xem note bên dưới (*)
        return q;
    }

    public void markAnswered() {
        if (this.answered) {
            throw new BusinessRuleException(
                    "Câu hỏi đã được trả lời", "QA_ALREADY_ANSWERED");
        }
        this.answered = true;
    }
}