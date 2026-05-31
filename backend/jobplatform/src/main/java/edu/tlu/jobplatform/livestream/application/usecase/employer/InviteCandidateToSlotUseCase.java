package edu.tlu.jobplatform.livestream.application.usecase.employer;

import edu.tlu.jobplatform.livestream.domain.model.LiveStreamSession;
import edu.tlu.jobplatform.livestream.domain.model.StreamEvent;
import edu.tlu.jobplatform.livestream.domain.model.vo.InterviewSlot;
import edu.tlu.jobplatform.livestream.domain.model.vo.StreamEventType;
import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.livestream.domain.repository.StreamEventRepository;
import edu.tlu.jobplatform.livestream.domain.service.SessionDomainService;
import edu.tlu.jobplatform.shared.event.livestream.StreamEventCreatedEvent;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

// InviteCandidateToSlotUseCase
@Service
@RequiredArgsConstructor
public class InviteCandidateToSlotUseCase {

        private final LiveStreamSessionRepository sessionRepository;
        private final StreamEventRepository eventRepository;
        private final SessionDomainService sessionDomainService;
        private final ApplicationEventPublisher eventPublisher;

        public record Command(UUID sessionId, UUID hostUserId, UUID candidateId, UUID slotId) {
        }

        @Transactional
        public InterviewSlot execute(Command cmd) {
                LiveStreamSession session = sessionRepository.findById(cmd.sessionId())
                                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiên stream"));

                sessionDomainService.validateCanInviteToSlot(session, cmd.hostUserId());

                InterviewSlot assignedSlot = session.assignSlotToCandidate(cmd.slotId(), cmd.candidateId());
                sessionRepository.save(session);

                String payload = """
                                {"candidateId":"%s","slotId":"%s","startTime":"%s","durationMinutes":%d}
                                """.formatted(
                                cmd.candidateId(),
                                assignedSlot.slotId(),
                                assignedSlot.startTime(),
                                assignedSlot.durationMinutes()).strip();

                StreamEvent inviteEvent = StreamEvent.of(
                                cmd.sessionId(),
                                cmd.hostUserId(),
                                StreamEventType.INTERVIEW_INVITE,
                                payload);
                eventRepository.save(inviteEvent);

                eventPublisher.publishEvent(new StreamEventCreatedEvent(
                                cmd.candidateId(),
                                cmd.sessionId(),
                                StreamEventType.INTERVIEW_INVITE,
                                payload));

                return assignedSlot;
        }
}