package edu.tlu.jobplatform.message.application.usecase;

import edu.tlu.jobplatform.message.domain.model.Conversation;
import edu.tlu.jobplatform.message.domain.repository.ConversationRepository;
import edu.tlu.jobplatform.message.domain.service.ConversationDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Employer khởi tạo conversation với candidate từ một job post.
 * Idempotent — nếu đã tồn tại thì trả về conversation cũ.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StartConversationUseCase {

    private final ConversationRepository conversationRepository;

    @Transactional
    public Conversation execute(Command cmd) {
        // Idempotent guard — tránh tạo duplicate
        return conversationRepository
                .findByParticipantsAndJobPost(cmd.employerId(), cmd.candidateId(), cmd.jobPostId())
                .orElseGet(() -> {
                    Conversation conv = ConversationDomainService.createConversation(
                            cmd.employerId(), cmd.candidateId(), cmd.jobPostId());
                    Conversation saved = conversationRepository.save(conv);
                    log.info("Conversation started: id={} employer={} candidate={} job={}",
                            saved.getId(), cmd.employerId(), cmd.candidateId(), cmd.jobPostId());
                    return saved;
                });
    }

    public record Command(UUID employerId, UUID candidateId, UUID jobPostId) {
    }
}