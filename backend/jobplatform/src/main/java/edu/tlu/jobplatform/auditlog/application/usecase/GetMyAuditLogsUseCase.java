package edu.tlu.jobplatform.auditlog.application.usecase;

import edu.tlu.jobplatform.auditlog.domain.model.AuditLog;
import edu.tlu.jobplatform.auditlog.domain.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Candidate / Employer xem lịch sử hành động của chính mình.
 * actorId luôn được lấy từ SecurityContext — không nhận từ request.
 */
@Service
@RequiredArgsConstructor
public class GetMyAuditLogsUseCase {

    private final AuditLogRepository auditLogRepository;

    public Page<AuditLog> execute(UUID actorId,
            String action,
            String resourceType,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable) {

        return auditLogRepository.findByActorId(
                actorId.toString(), action, resourceType, from, to, pageable);
    }
}