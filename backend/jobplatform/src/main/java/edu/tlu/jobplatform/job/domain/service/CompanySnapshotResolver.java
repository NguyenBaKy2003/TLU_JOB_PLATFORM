package edu.tlu.jobplatform.job.domain.service;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.job.application.dto.CompanySnapshot;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanySnapshotResolver {

    private final CompanyRepository companyRepository;

    public Map<UUID, CompanySnapshot> resolveAll(Collection<UUID> companyIds) {
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
                c.getSize() != null ? c.getSize().toString() : null,
                c.getWebsite());
    }
}