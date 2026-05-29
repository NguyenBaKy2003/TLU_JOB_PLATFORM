package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.repository.CompanyGalleryRepository;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.company.domain.repository.CompanyTeamMemberRepository;
import edu.tlu.jobplatform.company.presentation.dto.response.CompanyResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Tìm kiếm đa điều kiện công ty VERIFIED.
 *
 * Filter: keyword, city, size, minRating, planCode — tất cả optional.
 * Sort: plan tier (ENTERPRISE→BUSINESS→STARTER→FREE) → rating DESC → created_at
 * ASC.
 */
@Component
@RequiredArgsConstructor
public class SearchCompaniesUseCase {

    private final CompanyRepository companyRepository;
    private final CompanyTeamMemberRepository teamMemberRepository;
    private final CompanyGalleryRepository galleryRepository;

    public record Command(
            String keyword,
            String city,
            String size,
            String planCode,
            Double minRating,
            int page,
            int size_) {
    }

    public PageResponse<CompanyResponse> execute(Command cmd) {
        var pageable = PageRequest.of(cmd.page(), cmd.size_());

        // 1. Query DB — tất cả filter null-safe
        Page<CompanyProfile> companyPage = companyRepository.search(
                blankToNull(cmd.keyword()),
                blankToNull(cmd.city()),
                blankToNull(cmd.size()),
                blankToNull(cmd.planCode()),
                cmd.minRating(),
                pageable);

        // 2. Enrich stats batch
        companyRepository.enrichWithStats(companyPage.getContent());

        // 3. Batch planCode lookup
        Set<UUID> ids = companyPage.getContent().stream()
                .map(CompanyProfile::getId)
                .collect(Collectors.toSet());
        Map<UUID, String> planCodeMap = companyRepository.findActivePlanCodesByCompanyIds(ids);

        // 4. Map → response
        Page<CompanyResponse> result = companyPage.map(c -> CompanyResponse.from(
                c,
                teamMemberRepository.findVisibleByCompanyId(c.getId()),
                galleryRepository.findByCompanyId(c.getId()),
                planCodeMap.get(c.getId())));

        return PageResponse.from(result);
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}