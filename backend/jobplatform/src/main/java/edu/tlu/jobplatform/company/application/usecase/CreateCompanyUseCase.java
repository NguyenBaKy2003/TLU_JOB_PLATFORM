package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.CompanySize;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * UseCase: Tạo hồ sơ công ty mới.
 *
 * Business Rules:
 * BR-01: 1 user EMPLOYER chỉ được tạo 1 hồ sơ công ty
 * BR-02: Tên công ty phải unique
 * BR-03: Mặc định status = UNVERIFIED, chờ admin duyệt
 * BR-04: Slug tự động sinh từ tên công ty
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CreateCompanyUseCase {

    private final CompanyRepository companyRepository;

    @Transactional
    public CompanyProfile execute(Command cmd) {

        // BR-01: 1 employer chỉ có 1 company profile
        if (companyRepository.existsByOwnerId(cmd.ownerId())) {
            throw new BusinessRuleException(
                    "Tài khoản của bạn đã có hồ sơ công ty. Mỗi tài khoản chỉ được tạo 1 hồ sơ.",
                    "COMPANY_ALREADY_EXISTS");
        }

        // BR-02: Tên công ty phải unique
        if (companyRepository.existsByName(cmd.name())) {
            throw new BusinessRuleException(
                    "Tên công ty '" + cmd.name() + "' đã tồn tại. Vui lòng dùng tên khác.",
                    "COMPANY_NAME_TAKEN");
        }

        // Tạo slug unique từ tên công ty
        String slug = generateUniqueSlug(cmd.name());

        CompanyProfile company = CompanyProfile.builder()
                .id(UUID.randomUUID())
                .ownerId(cmd.ownerId())
                .name(cmd.name().trim())
                .slug(slug)
                .description(cmd.description())
                .website(cmd.website())
                .email(cmd.email())
                .phone(cmd.phone())
                .address(cmd.address())
                .city(cmd.city())
                .country(cmd.country() != null ? cmd.country() : "Việt Nam")
                .industry(cmd.industry())
                .size(cmd.size())
                .foundedYear(cmd.foundedYear())
                .verificationStatus(VerificationStatus.UNVERIFIED) // BR-03
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        CompanyProfile saved = companyRepository.save(company);
        log.info("Company created: {} [owner={}]", saved.getName(), saved.getOwnerId());

        return saved;
    }

    // ── Helper ────

    private String generateUniqueSlug(String name) {
        String base = SlugUtils.slugify(name);
        String slug = base;
        int suffix = 1;

        while (companyRepository.existsBySlug(slug)) {
            slug = base + "-" + suffix++;
        }
        return slug;
    }

    // ── Command ───

    public record Command(
            UUID ownerId,
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
            Integer foundedYear) {
    }
}