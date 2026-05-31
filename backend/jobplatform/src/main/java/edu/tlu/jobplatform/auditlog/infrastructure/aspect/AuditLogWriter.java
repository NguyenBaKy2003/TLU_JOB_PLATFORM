package edu.tlu.jobplatform.auditlog.infrastructure.aspect;

import edu.tlu.jobplatform.auditlog.domain.model.AuditLog;
import edu.tlu.jobplatform.auditlog.domain.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogWriter {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void save(AuditLog auditLog) {
        try {
            auditLogRepository.save(auditLog);
        } catch (Exception ex) {
            log.warn("[AuditLog] Failed to save [action={}] [actor={}]: {}",
                    auditLog.getAction(), auditLog.getActorId(), ex.getMessage());
        }
    }
}