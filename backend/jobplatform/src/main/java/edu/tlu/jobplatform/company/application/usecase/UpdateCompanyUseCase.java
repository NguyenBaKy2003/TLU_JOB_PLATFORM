package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.CompanySize;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * UseCase: Cập nhật thông tin hồ sơ công ty.
 *
 * Business Rules:
 * BR-01: Chỉ owner hoặc ADMIN mới được cập nhật
 * BR-02: Sau khi cập nhật thông tin quan trọng (tên, địa chỉ),
 * nếu đang VERIFIED → giữ nguyên VERIFIED (không reset)
 * BR-03: Công ty bị SUSPENDED không được cập nhật
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateCompanyUseCase {

    private final CompanyRepository companyRepository;

    @Transactional
    public CompanyProfile execute(UUID companyId, Command cmd) {

        CompanyProfile company = companyRepository.findById(companyId)
                .orElseThrow(() -> ResourceNotFoundException.of("Company", companyId));

        // BR-01: Chỉ owner hoặc admin
        if (!SecurityUtils.isOwnerOrAdmin(company.getOwnerId())) {
            throw new BusinessRuleException(
                    "Bạn không có quyền cập nhật hồ sơ công ty này.",
                    "FORBIDDEN");
        }

        // BR-03: Công ty bị khoá không được sửa
        if (!company.isActive()) {
            throw new BusinessRuleException(
                    "Hồ sơ công ty đang bị vô hiệu hoá.",
                    "COMPANY_INACTIVE");
        }

        // Cập nhật thông tin
        company.updateInfo(
                cmd.name() != null ? cmd.name() : company.getName(),
                cmd.description() != null ? cmd.description() : company.getDescription(),
                cmd.website() != null ? cmd.website() : company.getWebsite(),
                cmd.email() != null ? cmd.email() : company.getEmail(),
                cmd.phone() != null ? cmd.phone() : company.getPhone(),
                cmd.address() != null ? cmd.address() : company.getAddress(),
                cmd.city() != null ? cmd.city() : company.getCity(),
                cmd.country() != null ? cmd.country() : company.getCountry(),
                cmd.industry() != null ? cmd.industry() : company.getIndustry(),
                cmd.size() != null ? cmd.size() : company.getSize(),
                cmd.foundedYear() != null ? cmd.foundedYear() : company.getFoundedYear());

        if (cmd.logoUrl() != null || cmd.coverImageUrl() != null) {
            company.updateMedia(cmd.logoUrl(), cmd.coverImageUrl());
        }

        CompanyProfile saved = companyRepository.save(company);
        log.info("Company updated: {}", companyId);
        return saved;
    }

    // ── Command — PATCH semantics (tất cả nullable) ───────────

    public record Command(
            String name,
            String description,
            String website,
            String email,
            String phone,
            String address,
            String city,
            String country,
            String industry,
            CompanySize size,
            Integer foundedYear,
            String logoUrl,
            String coverImageUrl) {
    }
}