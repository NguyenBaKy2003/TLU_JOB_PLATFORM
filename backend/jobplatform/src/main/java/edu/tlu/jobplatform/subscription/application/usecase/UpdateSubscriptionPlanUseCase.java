package edu.tlu.jobplatform.subscription.application.usecase;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.auditlog.domain.model.AuditLog;
import edu.tlu.jobplatform.auditlog.infrastructure.aspect.AuditLogWriter;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import edu.tlu.jobplatform.subscription.application.snapshot.PlanSnapshot.EmployerPlanSnapshot;
import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateSubscriptionPlanUseCase {

    private final SubscriptionPlanRepository planRepository;
    private final AuditLogWriter auditLogWriter;
    private final ObjectMapper objectMapper;

    @Transactional
    public SubscriptionPlan execute(UUID planId, Command cmd) {

        SubscriptionPlan existing = planRepository.findById(planId)
                .orElseThrow(() -> ResourceNotFoundException.of("SubscriptionPlan", planId));

        if (cmd.priceMonthly() != null && cmd.priceMonthly().compareTo(BigDecimal.ZERO) < 0)
            throw new BusinessRuleException("Giá theo tháng không hợp lệ.", "INVALID_PRICE");
        if (cmd.priceYearly() != null && cmd.priceYearly().compareTo(BigDecimal.ZERO) < 0)
            throw new BusinessRuleException("Giá theo năm không hợp lệ.", "INVALID_PRICE");

        String oldSnapshot = toJson(EmployerPlanSnapshot.from(existing));

        SubscriptionPlan updated = SubscriptionPlan.builder()
                .id(existing.getId())
                .code(existing.getCode())
                .name(cmd.name() != null ? cmd.name().trim() : existing.getName())
                .description(cmd.description() != null ? cmd.description() : existing.getDescription())
                .priceMonthly(cmd.priceMonthly() != null ? cmd.priceMonthly() : existing.getPriceMonthly())
                .priceYearly(cmd.priceYearly() != null ? cmd.priceYearly() : existing.getPriceYearly())
                .jobPostLimit(cmd.jobPostLimit() != null ? cmd.jobPostLimit() : existing.getJobPostLimit())
                .featuredJobLimit(
                        cmd.featuredJobLimit() != null ? cmd.featuredJobLimit() : existing.getFeaturedJobLimit())
                .cvViewLimit(cmd.cvViewLimit() != null ? cmd.cvViewLimit() : existing.getCvViewLimit())
                .aiFeatures(cmd.aiFeatures() != null ? cmd.aiFeatures() : existing.isAiFeatures())
                .analyticsAccess(cmd.analyticsAccess() != null ? cmd.analyticsAccess() : existing.isAnalyticsAccess())
                .durationDays(cmd.durationDays() != null ? cmd.durationDays() : existing.getDurationDays())
                .active(cmd.active() != null ? cmd.active() : existing.isActive())
                .build();

        SubscriptionPlan saved = planRepository.save(updated);

        String newSnapshot = toJson(EmployerPlanSnapshot.from(saved));

        auditLogWriter.save(AuditLog.change(
                resolveActorId(),
                "ADMIN_UPDATE_SUBSCRIPTION_PLAN",
                "SubscriptionPlan",
                planId.toString(),
                oldSnapshot,
                newSnapshot,
                null, null, null));

        log.info("[UpdateSubscriptionPlan] id={} code={}", saved.getId(), saved.getCode());
        return saved;
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.warn("[UpdateSubscriptionPlan] Failed to serialize snapshot: {}", e.getMessage());
            return null;
        }
    }

    private String resolveActorId() {
        try {
            return SecurityUtils.getCurrentUserId()
                    .map(UUID::toString)
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    public record Command(
            String name,
            String description,
            BigDecimal priceMonthly,
            BigDecimal priceYearly,
            Integer jobPostLimit,
            Integer featuredJobLimit,
            Integer cvViewLimit,
            Boolean aiFeatures,
            Boolean analyticsAccess,
            Integer durationDays,
            Boolean active) {
    }
}