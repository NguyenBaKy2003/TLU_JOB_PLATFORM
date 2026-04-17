package edu.tlu.jobplatform.application.domain.service;

import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationResponse.CompanyInfo;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanyInfoResolver {

    private final CompanyRepository companyRepository;

    public Map<UUID, CompanyInfo> resolveAll(Collection<UUID> companyIds) {
        return companyRepository.findAllById(companyIds).stream()
                .collect(Collectors.toMap(
                        CompanyProfile::getId,
                        this::toCompanyInfo));
    }

    private CompanyInfo toCompanyInfo(CompanyProfile c) {
        return CompanyInfo.of(
                c.getId(),
                c.getName(),
                c.getLogoUrl(),
                c.getIndustry(),
                c.getWebsite(),
                c.getSize().toString(),
                c.getCity());
    }
}