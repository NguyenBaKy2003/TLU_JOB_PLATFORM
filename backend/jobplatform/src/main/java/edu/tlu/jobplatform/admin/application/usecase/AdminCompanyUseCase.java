package edu.tlu.jobplatform.admin.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.shared.event.company.CompanyVerifiedEvent;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminCompanyUseCase {

    private final CompanyRepository companyRepo;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public Page<CompanyProfile> list(VerificationStatus status, Pageable pageable) {
        if (status != null)
            return companyRepo.findByVerificationStatus(status, pageable);
        // Không filter → trả về toàn bộ công ty
        return companyRepo.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public CompanyProfile getById(UUID companyId) {
        return companyRepo.findById(companyId)
                .orElseThrow(() -> ResourceNotFoundException.of("Company", companyId));
    }

    /** Duyệt xác thực công ty */
    @Transactional
    public CompanyProfile approve(UUID companyId) {
        CompanyProfile company = getById(companyId);
        if (company.getVerificationStatus() == VerificationStatus.VERIFIED)
            throw new BusinessRuleException("Công ty đã được xác thực rồi.", "ALREADY_VERIFIED");

        UUID adminId = SecurityUtils.getCurrentUserIdOrThrow();
        company.verify(adminId);
        CompanyProfile saved = companyRepo.save(company);

        eventPublisher.publishEvent(new CompanyVerifiedEvent(
                saved.getId(), saved.getName(), saved.getEmail(), saved.getOwnerId()));

        log.info("Admin approved company: {} by admin={}", companyId, adminId);
        return saved;
    }

    /** Từ chối xác thực */
    @Transactional
    public CompanyProfile reject(UUID companyId, String reason) {
        if (reason == null || reason.isBlank())
            throw new BusinessRuleException("Vui lòng nhập lý do từ chối.", "REASON_REQUIRED");
        CompanyProfile company = getById(companyId);
        company.reject(reason);
        log.info("Admin rejected company: {} reason='{}'", companyId, reason);
        return companyRepo.save(company);
    }

    /** Khoá công ty */
    @Transactional
    public CompanyProfile suspend(UUID companyId, String reason) {
        CompanyProfile company = getById(companyId);
        company.suspend();
        log.warn("Admin suspended company: {} reason='{}'", companyId, reason);
        return companyRepo.save(company);
    }

    /** Mở khoá công ty */
    @Transactional
    public CompanyProfile unsuspend(UUID companyId) {
        CompanyProfile company = getById(companyId);
        // Cho phép kích hoạt lại — reset về VERIFIED nếu trước đó đã verified
        company.verify(SecurityUtils.getCurrentUserIdOrThrow());
        log.info("Admin unsuspended company: {}", companyId);
        return companyRepo.save(company);
    }
}