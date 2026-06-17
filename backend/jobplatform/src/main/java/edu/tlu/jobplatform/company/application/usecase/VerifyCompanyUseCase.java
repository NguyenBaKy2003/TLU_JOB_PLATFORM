package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.company.domain.service.CompanyVerificationService;
import edu.tlu.jobplatform.shared.event.company.CompanyVerifiedEvent;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VerifyCompanyUseCase {

    private final CompanyRepository companyRepository;
    private final CompanyVerificationService verificationService;
    private final ApplicationEventPublisher eventPublisher;

    // ── Approve

    @Transactional
    public CompanyProfile approve(UUID companyId) {

        CompanyProfile company = companyRepository.findById(companyId)
                .orElseThrow(() -> ResourceNotFoundException.of("Company", companyId));

        verificationService.validateForApproval(company);

        UUID adminId = SecurityUtils.getCurrentUserIdOrThrow();
        company.verify(adminId);
        CompanyProfile saved = companyRepository.save(company);

        // Fire event → Notification + Search index
        eventPublisher.publishEvent(new CompanyVerifiedEvent(
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getOwnerId()));

        log.info("Company verified: {} by admin={}", companyId, adminId);
        return saved;
    }

    // ── Reject ─

    @Transactional
    public CompanyProfile reject(UUID companyId, String reason) {

        CompanyProfile company = companyRepository.findById(companyId)
                .orElseThrow(() -> ResourceNotFoundException.of("Company", companyId));

        verificationService.validateRejectionReason(reason);

        company.reject(reason);
        CompanyProfile saved = companyRepository.save(company);

        log.info("Company rejected: {} reason='{}'", companyId, reason);
        return saved;
    }

    // ── Suspend

    @Transactional
    public CompanyProfile suspend(UUID companyId) {

        CompanyProfile company = companyRepository.findById(companyId)
                .orElseThrow(() -> ResourceNotFoundException.of("Company", companyId));

        company.suspend();
        CompanyProfile saved = companyRepository.save(company);

        log.warn("Company suspended: {}", companyId);
        return saved;
    }
}