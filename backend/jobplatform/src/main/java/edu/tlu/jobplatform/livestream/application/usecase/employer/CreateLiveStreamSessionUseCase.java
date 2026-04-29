package edu.tlu.jobplatform.livestream.application.usecase.employer;

import edu.tlu.jobplatform.livestream.application.port.out.StreamQuotaServicePort;
import edu.tlu.jobplatform.livestream.domain.model.LiveStreamSession;
import edu.tlu.jobplatform.livestream.domain.model.vo.InterviewSlot;
import edu.tlu.jobplatform.livestream.domain.model.vo.SessionType;
import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreateLiveStreamSessionUseCase {

    private final LiveStreamSessionRepository sessionRepository;
    private final StreamQuotaServicePort quotaServicePort;

    public record Command(
            UUID companyId,
            UUID hostUserId,
            String title,
            String description,
            SessionType sessionType,
            LocalDateTime scheduledAt,
            List<InterviewSlot> interviewSlots // chỉ có khi type = INTERVIEW
    ) {
    }

    @Transactional
    public LiveStreamSession execute(Command cmd) {
        // 1. Kiểm tra quota
        if (!quotaServicePort.hasStreamQuota(cmd.companyId())) {
            throw new BusinessRuleException(
                    "Công ty đã đạt giới hạn số phiên stream trong tháng. Vui lòng nâng cấp gói.",
                    "STREAM_QUOTA_EXCEEDED");
        }

        // 2. Lấy maxViewers từ plan của company
        int maxViewers = quotaServicePort.getMaxViewersForCompany(cmd.companyId());

        // 3. Tạo session
        List<InterviewSlot> slots = (cmd.sessionType() == SessionType.INTERVIEW && cmd.interviewSlots() != null)
                ? cmd.interviewSlots()
                : List.of();

        LiveStreamSession session = LiveStreamSession.create(
                cmd.companyId(),
                cmd.hostUserId(),
                cmd.title(),
                cmd.description(),
                cmd.sessionType(),
                cmd.scheduledAt(),
                maxViewers,
                slots);

        LiveStreamSession saved = sessionRepository.save(session);

        // 4. Publish event để notification domain gửi thông báo cho followers
        // eventPublisher.publishEvent(new SessionCreatedEvent(saved.getId(),
        // saved.getCompanyId(), ...));

        return saved;
    }
}