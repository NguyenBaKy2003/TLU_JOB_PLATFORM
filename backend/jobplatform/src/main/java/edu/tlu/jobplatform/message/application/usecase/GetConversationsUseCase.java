// application/usecase/GetConversationsUseCase.java
package edu.tlu.jobplatform.message.application.usecase;

import edu.tlu.jobplatform.message.application.port.out.ParticipantQueryPort;
import edu.tlu.jobplatform.message.domain.model.Conversation;
import edu.tlu.jobplatform.message.domain.repository.ConversationRepository;
import edu.tlu.jobplatform.message.presentation.dto.response.ConversationResponse;
import edu.tlu.jobplatform.message.presentation.dto.response.ParticipantInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetConversationsUseCase {

    private final ConversationRepository conversationRepository;
    private final ParticipantQueryPort participantQueryPort;

    public record Result(List<ConversationResponse> conversations, int totalUnread) {
    }

    public Result execute(UUID viewerId, int page, int size) {
        List<Conversation> conversations = conversationRepository.findByParticipant(viewerId, page, size);

        // ── Batch load để tránh N+1 ───────────────────────────────────────────
        Set<UUID> employerIds = conversations.stream()
                .map(Conversation::getParticipantA).collect(Collectors.toSet());
        Set<UUID> candidateIds = conversations.stream()
                .map(Conversation::getParticipantB).collect(Collectors.toSet());

        Map<UUID, ParticipantInfo> employerMap = participantQueryPort.getEmployersByOwnerIds(employerIds);
        Map<UUID, ParticipantInfo> candidateMap = participantQueryPort.getCandidatesByUserIds(candidateIds);

        List<ConversationResponse> responses = conversations.stream()
                .map(c -> ConversationResponse.from(
                        c,
                        viewerId,
                        employerMap.get(c.getParticipantA()),
                        candidateMap.get(c.getParticipantB())))
                .toList();

        int totalUnread = conversationRepository.countUnreadByParticipant(viewerId);

        return new Result(responses, totalUnread);
    }
}