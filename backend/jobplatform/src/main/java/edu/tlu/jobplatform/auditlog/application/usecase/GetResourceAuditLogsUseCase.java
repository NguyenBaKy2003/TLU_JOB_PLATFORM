package edu.tlu.jobplatform.auditlog.application.usecase;

import edu.tlu.jobplatform.auditlog.domain.model.AuditLog;
import edu.tlu.jobplatform.auditlog.domain.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/** ADMIN xem toàn bộ log thay đổi của 1 entity cụ thể */
@Service
@RequiredArgsConstructor
public class GetResourceAuditLogsUseCase {

    private final AuditLogRepository auditLogRepository;

    public Page<AuditLog> execute(String resourceType, String resourceId,
            Pageable pageable) {
        return auditLogRepository.findByResource(resourceType, resourceId, pageable);
    }
}