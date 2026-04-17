// application/usecase/StartConversationUseCase.java
package edu.tlu.jobplatform.message.application.usecase;

import edu.tlu.jobplatform.message.application.port.out.ParticipantQueryPort;
import edu.tlu.jobplatform.message.domain.model.Conversation;
import edu.tlu.jobplatform.message.domain.repository.ConversationRepository;
import edu.tlu.jobplatform.message.domain.service.ConversationDomainService;
import edu.tlu.jobplatform.message.presentation.dto.response.ConversationResponse;
import edu.tlu.jobplatform.message.presentation.dto.response.ParticipantInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StartConversationUseCase {

    private final ConversationRepository conversationRepository;
    private final ParticipantQueryPort participantQueryPort;

    public record Command(UUID employerId, UUID candidateId, UUID jobPostId) {
    }

    @Transactional
    public ConversationResponse execute(Command cmd) {
        // Idempotent — trả về conversation cũ nếu đã tồn tại
        Conversation conversation = conversationRepository
                .findByParticipantsAndJobPost(cmd.employerId(), cmd.candidateId(), cmd.jobPostId())
                .orElseGet(() -> {
                    Conversation created = ConversationDomainService.createConversation(
                            cmd.employerId(), cmd.candidateId(), cmd.jobPostId());
                    return conversationRepository.save(created);
                });

        ParticipantInfo employer = participantQueryPort.getEmployer(conversation.getParticipantA());
        ParticipantInfo candidate = participantQueryPort.getCandidate(conversation.getParticipantB());

        return ConversationResponse.from(conversation, cmd.employerId(), employer, candidate);
    }
}