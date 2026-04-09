package edu.tlu.jobplatform.application.usecase.employer;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.application.domain.service.ApplicationDomainService;
import edu.tlu.jobplatform.application.infrastructure.event.ApplicationDomainEventPublisher;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleInterviewUseCase {

    private final ApplicationRepository applicationRepo;
    private final ApplicationDomainService domainService;
    private final ApplicationDomainEventPublisher eventPublisher;

    @Transactional
    public Application execute(UUID applicationId, Command cmd) {

        Application app = applicationRepo.findById(applicationId)
                .orElseThrow(() -> ResourceNotFoundException.of("Application", applicationId));

        if (!SecurityUtils.isOwnerOrAdmin(app.getCompanyId()))
            throw new BusinessRuleException("Bạn không có quyền thực hiện hành động này.", "FORBIDDEN");

        domainService.validateInterviewSchedule(cmd.scheduledAt());

        ApplicationStatus prevStatus = app.getStatus();
        app.scheduleInterview(cmd.scheduledAt(), cmd.location(), cmd.note());
        Application saved = applicationRepo.save(app);

        UUID changedBy = SecurityUtils.getCurrentUserIdOrThrow();
        domainService.logStatusChange(saved, prevStatus,
                "Lịch phỏng vấn: " + cmd.scheduledAt(), changedBy);
        eventPublisher.publishInterviewScheduled(saved);

        log.info("Interview scheduled: applicationId={} at={}", applicationId, cmd.scheduledAt());
        return saved;
    }

    public record Command(LocalDateTime scheduledAt, String location, String note) {
    }
}