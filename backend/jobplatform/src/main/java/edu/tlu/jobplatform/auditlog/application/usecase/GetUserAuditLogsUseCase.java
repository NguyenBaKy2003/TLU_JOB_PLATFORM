package edu.tlu.jobplatform.auditlog.application.usecase;

import edu.tlu.jobplatform.auditlog.domain.model.AuditLog;
import edu.tlu.jobplatform.auditlog.domain.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

/** ADMIN xem log của 1 user cụ thể */
@Service
@RequiredArgsConstructor
public class GetUserAuditLogsUseCase {

    private final AuditLogRepository auditLogRepository;

    public Page<AuditLog> execute(UUID userId, String action, Pageable pageable) {
        return auditLogRepository.findByActorId(
                userId.toString(), action, null, null, null, pageable);
    }
}