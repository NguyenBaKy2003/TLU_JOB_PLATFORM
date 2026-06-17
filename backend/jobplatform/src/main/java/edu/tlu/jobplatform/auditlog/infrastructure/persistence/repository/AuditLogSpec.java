package edu.tlu.jobplatform.auditlog.infrastructure.persistence.repository;

import edu.tlu.jobplatform.auditlog.infrastructure.persistence.entity.AuditLogJpaEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public final class AuditLogSpec {

    private AuditLogSpec() {
    }

    public static Specification<AuditLogJpaEntity> filter(
            String actorId,
            String action,
            String resourceType,
            String resourceId,
            String result,
            LocalDateTime from,
            LocalDateTime to) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (actorId != null && !actorId.isBlank())
                predicates.add(cb.equal(root.get("actorId"), actorId));

            if (action != null && !action.isBlank())
                predicates.add(cb.equal(root.get("action"), action));

            if (resourceType != null && !resourceType.isBlank())
                predicates.add(cb.equal(root.get("resourceType"), resourceType));

            if (resourceId != null && !resourceId.isBlank())
                predicates.add(cb.equal(root.get("resourceId"), resourceId));

            if (result != null && !result.isBlank())
                predicates.add(cb.equal(root.get("result"), result));

            if (from != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("occurredAt"), from));

            if (to != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("occurredAt"), to));

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}