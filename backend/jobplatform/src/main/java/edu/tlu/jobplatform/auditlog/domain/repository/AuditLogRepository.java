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

        // ── Write ───────

        void save(AuditLog auditLog);

        // ── Read — by actor ──────────────────────────────────────────────

        Page<AuditLog> findByActorId(String actorId, String action,
                        String resourceType,
                        LocalDateTime from, LocalDateTime to,
                        Pageable pageable);

        // ── Read — by resource ───────────────────────────────────────────

        Page<AuditLog> findByResource(String resourceType, String resourceId,
                        Pageable pageable);

        // ── Read — system wide ───────────────────────────────────────────

        Page<AuditLog> findAll(String actorId, String action,
                        String resourceType, String result,
                        LocalDateTime from, LocalDateTime to,
                        Pageable pageable);

        /** Đếm số action theo loại trong khoảng thời gian — dùng cho stats endpoint */
        Map<String, Long> countByAction(LocalDateTime from, LocalDateTime to);

        /** Đếm login failures trong khoảng thời gian — brute force detection */
        long countFailures(String actorId, String action, LocalDateTime after);
}