package edu.tlu.jobplatform.shared.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /** Lịch sử hành động của 1 user */
    List<AuditLog> findByActorIdOrderByOccurredAtDesc(String actorId);

    /** Lịch sử thay đổi của 1 resource cụ thể */
    List<AuditLog> findByResourceTypeAndResourceIdOrderByOccurredAtDesc(
            String resourceType, String resourceId);

    /** Đếm login failures trong khoảng thời gian — brute force detection */
    long countByActionAndActorIdAndResultAndOccurredAtAfter(
            String action, String actorId, String result, LocalDateTime after);
}
