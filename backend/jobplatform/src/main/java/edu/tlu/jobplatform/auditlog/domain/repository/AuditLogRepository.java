package edu.tlu.jobplatform.auditlog.domain.repository;

import edu.tlu.jobplatform.auditlog.domain.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Port ra ngoài — infrastructure implement.
 * Tách read port (query) và write port (persist) để tuân thủ ISP.
 */
public interface AuditLogRepository {

        void save(AuditLog auditLog);

        Page<AuditLog> findByActorId(String actorId, String action,
                        String resourceType,
                        LocalDateTime from, LocalDateTime to,
                        Pageable pageable);

        Page<AuditLog> findByResource(String resourceType, String resourceId,
                        Pageable pageable);

        Page<AuditLog> findAll(String actorId, String action,
                        String resourceType, String result,
                        LocalDateTime from, LocalDateTime to,
                        Pageable pageable);

        Map<String, Long> countByAction(LocalDateTime from, LocalDateTime to);

        long countFailures(String actorId, String action, LocalDateTime after);
}