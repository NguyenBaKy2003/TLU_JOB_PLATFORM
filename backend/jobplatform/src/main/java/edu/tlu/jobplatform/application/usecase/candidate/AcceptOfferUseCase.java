package edu.tlu.jobplatform.application.usecase.candidate;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.ApplicationStatusLog;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.application.domain.repository.ApplicationStatusLogRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AcceptOfferUseCase {

    private final ApplicationRepository applicationRepo;
    private final ApplicationStatusLogRepository logRepo;

    public record Command(UUID applicationId, String note) {
    }

    @Transactional
    public Application execute(Command command) {
        Application app = applicationRepo.findById(command.applicationId())
                .orElseThrow(() -> ResourceNotFoundException.of("Application", command.applicationId()));

        UUID currentUserId = SecurityUtils.getCurrentUserIdOrThrow();

        // Chỉ chính ứng viên sở hữu đơn mới được thực hiện
        if (!app.getCandidateId().equals(currentUserId)) {
            throw new BusinessRuleException(
                    "Bạn không có quyền thực hiện hành động này.", "FORBIDDEN");
        }

        // Dùng assertCanTransitionTo() — đã xử lý BusinessRuleException bên trong
        app.getStatus().assertCanTransitionTo(ApplicationStatus.ACCEPTED);

        ApplicationStatus previousStatus = app.getStatus();
        app.acceptOffer();
        Application saved = applicationRepo.save(app);

        logRepo.save(ApplicationStatusLog.builder()
                .id(UUID.randomUUID())
                .applicationId(app.getId())
                .fromStatus(previousStatus)
                .toStatus(ApplicationStatus.ACCEPTED)
                .changedBy(currentUserId)
                .note(command.note())
                .changedAt(LocalDateTime.now())
                .build());

        return saved;
    }
}