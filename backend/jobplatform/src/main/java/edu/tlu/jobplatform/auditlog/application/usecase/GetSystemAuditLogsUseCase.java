package edu.tlu.jobplatform.auditlog.application.usecase;

import edu.tlu.jobplatform.auditlog.domain.model.AuditLog;
import edu.tlu.jobplatform.auditlog.domain.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

/** ADMIN xem toàn bộ log hệ thống với filter đa điều kiện */
@Service
@RequiredArgsConstructor
public class GetSystemAuditLogsUseCase {

    private final AuditLogRepository auditLogRepository;

    public Page<AuditLog> execute(String actorId, String action,
            String resourceType, String result,
            LocalDateTime from, LocalDateTime to,
            Pageable pageable) {

        return auditLogRepository.findAll(
                actorId, action, resourceType, result, from, to, pageable);
    }

    public Map<String, Long> countByAction(LocalDateTime from, LocalDateTime to) {
        return auditLogRepository.countByAction(from, to);
    }
}