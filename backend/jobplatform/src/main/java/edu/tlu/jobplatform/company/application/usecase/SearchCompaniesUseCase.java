package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyGalleryImage;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.CompanyTeamMember;
import edu.tlu.jobplatform.company.domain.repository.CompanyGalleryRepository;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.company.domain.repository.CompanyTeamMemberRepository;
import edu.tlu.jobplatform.company.presentation.dto.response.CompanyResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.List;
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

                Page<CompanyProfile> companyPage = companyRepository.search(
                                blankToNull(cmd.keyword()), blankToNull(cmd.city()),
                                blankToNull(cmd.size()), blankToNull(cmd.planCode()),
                                cmd.minRating(), pageable);

                companyRepository.enrichWithStats(companyPage.getContent());

                Set<UUID> ids = companyPage.getContent().stream()
                                .map(CompanyProfile::getId)
                                .collect(Collectors.toSet());

                // 3 batch queries thay vì N×2
                Map<UUID, String> planCodeMap = companyRepository.findActivePlanCodesByCompanyIds(ids);
                Map<UUID, List<CompanyTeamMember>> teamMap = teamMemberRepository.findVisibleByCompanyIds(ids);
                Map<UUID, List<CompanyGalleryImage>> galleryMap = galleryRepository.findByCompanyIds(ids);

                Page<CompanyResponse> result = companyPage.map(c -> CompanyResponse.from(
                                c,
                                teamMap.getOrDefault(c.getId(), List.of()),
                                galleryMap.getOrDefault(c.getId(), List.of()),
                                planCodeMap.get(c.getId())));

                return PageResponse.from(result);
        }

        private static String blankToNull(String s) {
                return (s == null || s.isBlank()) ? null : s.trim();
        }
}