package edu.tlu.jobplatform.job.infrastructure.adapter;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.job.application.dto.CompanySnapshot;
import edu.tlu.jobplatform.job.application.port.out.CompanyQueryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CompanyQueryAdapter implements CompanyQueryPort {

    private final CompanyRepository companyRepository;

    @Override
    public CompanySnapshot findById(UUID companyId) {
        return companyRepository.findById(companyId)
                .map(this::toSnapshot)
                .orElse(null);
    }

    @Override
    public Map<UUID, CompanySnapshot> findByIds(Set<UUID> companyIds) {
        return companyRepository.findAllById(companyIds).stream()
                .collect(Collectors.toMap(
                        CompanyProfile::getId,
                        this::toSnapshot));
    }

    private CompanySnapshot toSnapshot(CompanyProfile c) {
        return new CompanySnapshot(
                c.getId(),
                c.getName(),
                c.getLogoUrl(),
                c.getIndustry(),
                c.getSize() != null ? c.getSize().name() : null,
                c.getWebsite());
    }
}