package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.company.domain.repository.CompanyGalleryRepository;
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

@Component
@RequiredArgsConstructor
public class ListVerifiedCompaniesUseCase {

    private final CompanyRepository companyRepository;
    private final CompanyTeamMemberRepository teamMemberRepository;
    private final CompanyGalleryRepository galleryRepository;

    public PageResponse<CompanyResponse> execute(int page, int size) {
        var pageable = PageRequest.of(page, size);

        // 1. Load page đã sort theo plan tier ở DB
        Page<CompanyProfile> companyPage = companyRepository.findVerifiedCompaniesSortedByPlan(pageable);

        // 2. Enrich stats (active_job_count, rating...) — 1 batch query
        companyRepository.enrichWithStats(companyPage.getContent());

        // 3. Batch load planCode cho toàn page — 1 query duy nhất
        Set<UUID> ids = companyPage.getContent().stream()
                .map(CompanyProfile::getId)
                .collect(Collectors.toSet());

        Map<UUID, String> planCodeMap = companyRepository.findActivePlanCodesByCompanyIds(ids);

        // 4. Map sang response — team + gallery load per-company (có thể batch nếu cần)
        Page<CompanyResponse> result = companyPage.map(c -> CompanyResponse.from(
                c,
                teamMemberRepository.findVisibleByCompanyId(c.getId()),
                galleryRepository.findByCompanyId(c.getId()),
                planCodeMap.get(c.getId())));

        return PageResponse.from(result);
    }
}