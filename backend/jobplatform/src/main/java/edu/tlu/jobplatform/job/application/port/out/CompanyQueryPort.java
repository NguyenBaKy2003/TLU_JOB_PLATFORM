package edu.tlu.jobplatform.job.application.port.out;

import edu.tlu.jobplatform.job.application.dto.CompanySnapshot;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

public interface CompanyQueryPort {
    CompanySnapshot findById(UUID companyId);

    Map<UUID, CompanySnapshot> findByIds(Set<UUID> companyIds);
}