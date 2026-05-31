package edu.tlu.jobplatform.subscription.application.usecase;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.auditlog.domain.model.AuditLog;
import edu.tlu.jobplatform.auditlog.infrastructure.aspect.AuditLogWriter;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import edu.tlu.jobplatform.subscription.application.snapshot.PlanSnapshot.CandidatePlanSnapshot;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateCandidatePlanUseCase {

        private final CandidateSubscriptionPlanRepository planRepository;
        private final AuditLogWriter auditLogWriter;
        private final ObjectMapper objectMapper;

        @Transactional
        public CandidateSubscriptionPlan execute(UUID planId, Command cmd) {

                CandidateSubscriptionPlan existing = planRepository.findById(planId)
                                .orElseThrow(() -> ResourceNotFoundException.of("CandidateSubscriptionPlan", planId));

                if (cmd.priceMonthly() != null && cmd.priceMonthly().compareTo(BigDecimal.ZERO) < 0)
                        throw new BusinessRuleException("Giá theo tháng không hợp lệ.", "INVALID_PRICE");
                if (cmd.priceYearly() != null && cmd.priceYearly().compareTo(BigDecimal.ZERO) < 0)
                        throw new BusinessRuleException("Giá theo năm không hợp lệ.", "INVALID_PRICE");

                String oldSnapshot = toJson(CandidatePlanSnapshot.from(existing));

                CandidateSubscriptionPlan updated = CandidateSubscriptionPlan.builder()
                                .id(existing.getId())
                                .code(existing.getCode())
                                .free(existing.isFree())
                                .name(cmd.name() != null ? cmd.name().trim() : existing.getName())
                                .description(cmd.description() != null ? cmd.description() : existing.getDescription())
                                .priceMonthly(cmd.priceMonthly() != null ? cmd.priceMonthly()
                                                : existing.getPriceMonthly())
                                .priceYearly(cmd.priceYearly() != null ? cmd.priceYearly() : existing.getPriceYearly())
                                .applicationLimit(cmd.applicationLimit() != null ? cmd.applicationLimit()
                                                : existing.getApplicationLimit())
                                .cvBoostLimit(cmd.cvBoostLimit() != null ? cmd.cvBoostLimit()
                                                : existing.getCvBoostLimit())
                                .cvCreateLimit(cmd.cvCreateLimit() != null ? cmd.cvCreateLimit()
                                                : existing.getCvCreateLimit())
                                .aiCvWriter(cmd.aiCvWriter() != null ? cmd.aiCvWriter() : existing.isAiCvWriter())
                                .premiumTemplateAccess(cmd.premiumTemplateAccess() != null
                                                ? cmd.premiumTemplateAccess()
                                                : existing.isPremiumTemplateAccess())
                                .durationDays(cmd.durationDays() != null ? cmd.durationDays()
                                                : existing.getDurationDays())
                                .active(cmd.active() != null ? cmd.active() : existing.isActive())
                                .build();

                CandidateSubscriptionPlan saved = planRepository.save(updated);

                String newSnapshot = toJson(CandidatePlanSnapshot.from(saved));

                auditLogWriter.save(AuditLog.change(
                                resolveActorId(),
                                "ADMIN_UPDATE_CANDIDATE_PLAN",
                                "CandidateSubscriptionPlan",
                                planId.toString(),
                                oldSnapshot,
                                newSnapshot,
                                null, null, null));

                log.info("[UpdateCandidatePlan] id={} code={}", saved.getId(), saved.getCode());
                return saved;
        }

        private String toJson(Object obj) {
                try {
                        return objectMapper.writeValueAsString(obj);
                } catch (Exception e) {
                        log.warn("[UpdateCandidatePlan] Failed to serialize snapshot: {}", e.getMessage());
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
                        Integer applicationLimit,
                        Integer cvBoostLimit,
                        Integer cvCreateLimit,
                        Boolean aiCvWriter,
                        Boolean premiumTemplateAccess,
                        Integer durationDays,
                        Boolean active) {
        }
}