package edu.tlu.jobplatform.application.usecase.candidate;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.application.domain.service.ApplicationDomainService;
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
public class WithdrawApplicationUseCase {

    private final ApplicationRepository applicationRepo;
    private final ApplicationDomainService domainService;

    @Transactional
    public Application execute(UUID applicationId) {
        Application app = applicationRepo.findById(applicationId)
                .orElseThrow(() -> ResourceNotFoundException.of("Application", applicationId));

        if (!SecurityUtils.isOwnerOrAdmin(app.getCandidateId()))
            throw new BusinessRuleException("Bạn không có quyền rút đơn này.", "FORBIDDEN");

        ApplicationStatus prevStatus = app.getStatus();
        app.withdraw();
        Application saved = applicationRepo.save(app);

        domainService.logStatusChange(saved, prevStatus, "Ứng viên tự rút đơn",
                app.getCandidateId());

        log.info("Application withdrawn: id={}", applicationId);
        return saved;
    }
}