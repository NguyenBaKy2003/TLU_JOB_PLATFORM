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

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateApplicationStatusUseCase {

    private final ApplicationRepository applicationRepo;
    private final ApplicationDomainService domainService;
    private final ApplicationDomainEventPublisher eventPublisher;

    @Transactional
    public Application execute(UUID applicationId, ApplicationStatus newStatus, String note) {

        Application app = applicationRepo.findById(applicationId)
                .orElseThrow(() -> ResourceNotFoundException.of("Application", applicationId));

        if (!SecurityUtils.isOwnerOrAdmin(app.getCompanyId()))
            throw new BusinessRuleException("Bạn không có quyền cập nhật đơn này.", "FORBIDDEN");

        if (newStatus == ApplicationStatus.WITHDRAWN)
            throw new BusinessRuleException("Chỉ ứng viên mới có thể rút đơn.", "INVALID_ACTION");

        ApplicationStatus prevStatus = app.getStatus();
        app.updateStatus(newStatus, note);
        Application saved = applicationRepo.save(app);

        UUID changedBy = SecurityUtils.getCurrentUserIdOrThrow();
        domainService.logStatusChange(saved, prevStatus, note, changedBy);
        eventPublisher.publishStatusChanged(saved, prevStatus);

        log.info("Application status updated: id={} {} → {}", applicationId, prevStatus, newStatus);
        return saved;
    }
}