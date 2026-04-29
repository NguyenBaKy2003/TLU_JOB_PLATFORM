// livestream/presentation/dto/ws/payload/QAQuestionPayload.java
package edu.tlu.jobplatform.livestream.presentation.dto.ws.payload;

import edu.tlu.jobplatform.livestream.domain.model.QAQuestion;
import java.time.LocalDateTime;
import java.util.UUID;

public record QAQuestionPayload(
        UUID id,
        UUID sessionId,
        UUID candidateId,
        String candidateName,
        String question,
        boolean answered,
        LocalDateTime askedAt
) {
    public static QAQuestionPayload from(QAQuestion q) {
        return new QAQuestionPayload(
                q.getId(), q.getSessionId(), q.getCandidateId(),
                q.getCandidateName(), q.getQuestion(),
                q.isAnswered(), q.getAskedAt());
    }
}