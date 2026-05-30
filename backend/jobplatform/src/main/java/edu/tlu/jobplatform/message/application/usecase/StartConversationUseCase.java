package edu.tlu.jobplatform.message.application.usecase;

import edu.tlu.jobplatform.message.application.port.out.ParticipantQueryPort;
import edu.tlu.jobplatform.message.domain.model.Conversation;
import edu.tlu.jobplatform.message.domain.repository.ConversationRepository;
import edu.tlu.jobplatform.message.domain.service.ConversationDomainService;
import edu.tlu.jobplatform.message.presentation.dto.response.ConversationResponse;
import edu.tlu.jobplatform.message.presentation.dto.response.ParticipantInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StartConversationUseCase {

    private final ConversationRepository conversationRepository;
    private final ParticipantQueryPort participantQueryPort;

    public record Command(UUID employerId, UUID candidateId, UUID jobPostId) {
    }

    @Transactional
    public ConversationResponse execute(Command cmd) {
        Conversation conversation;

        try {
            conversation = conversationRepository
                    // FIX: chỉ tìm theo cặp người dùng, bỏ jobPostId
                    .findByParticipants(cmd.employerId(), cmd.candidateId())
                    .orElseGet(() -> {
                        log.info("Creating new conversation: employer={}, candidate={}",
                                cmd.employerId(), cmd.candidateId());
                        Conversation created = ConversationDomainService.createConversation(
                                cmd.employerId(), cmd.candidateId(), cmd.jobPostId());
                        return conversationRepository.save(created);
                    });

        } catch (DataIntegrityViolationException e) {
            log.warn("Duplicate conversation (race condition), fetching existing. employer={}, candidate={}",
                    cmd.employerId(), cmd.candidateId());
            conversation = conversationRepository
                    .findByParticipants(cmd.employerId(), cmd.candidateId())
                    .orElseThrow(() -> new IllegalStateException(
                            "Conversation not found after duplicate key conflict", e));
        }

        ParticipantInfo employer = participantQueryPort.getEmployer(conversation.getParticipantA());
        ParticipantInfo candidate = participantQueryPort.getCandidate(conversation.getParticipantB());

        return ConversationResponse.from(conversation, cmd.employerId(), employer, candidate);
    }
}