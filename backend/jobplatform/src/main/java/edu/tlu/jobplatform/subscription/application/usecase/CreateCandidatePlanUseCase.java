package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class CreateCandidatePlanUseCase {

    private final CandidateSubscriptionPlanRepository planRepository;

    @Transactional
    public CandidateSubscriptionPlan execute(Command cmd) {

        planRepository.findByCode(cmd.code().toUpperCase()).ifPresent(existing -> {
            throw new BusinessRuleException(
                    "Gói dịch vụ với code '" + cmd.code() + "' đã tồn tại.",
                    "PLAN_CODE_DUPLICATE");
        });

        if (!cmd.free()) {
            if (cmd.priceMonthly() == null || cmd.priceMonthly().compareTo(BigDecimal.ZERO) <= 0)
                throw new BusinessRuleException("Giá theo tháng không hợp lệ.", "INVALID_PRICE");
            if (cmd.priceYearly() == null || cmd.priceYearly().compareTo(BigDecimal.ZERO) <= 0)
                throw new BusinessRuleException("Giá theo năm không hợp lệ.", "INVALID_PRICE");
        }

        if (cmd.applicationLimit() < -1)
            throw new BusinessRuleException("applicationLimit phải >= -1.", "INVALID_QUOTA");
        if (cmd.cvBoostLimit() < 0)
            throw new BusinessRuleException("cvBoostLimit phải >= 0.", "INVALID_QUOTA");
        if (cmd.cvCreateLimit() < -1)
            throw new BusinessRuleException("cvCreateLimit phải >= -1 (-1 = unlimited).", "INVALID_QUOTA");

        CandidateSubscriptionPlan plan = CandidateSubscriptionPlan.builder()
                .code(cmd.code().toUpperCase().trim())
                .name(cmd.name().trim())
                .description(cmd.description())
                .priceMonthly(cmd.priceMonthly())
                .priceYearly(cmd.priceYearly())
                .applicationLimit(cmd.applicationLimit())
                .cvBoostLimit(cmd.cvBoostLimit())
                .cvCreateLimit(cmd.cvCreateLimit())
                .aiCvWriter(cmd.aiCvWriter())
                .premiumTemplateAccess(cmd.premiumTemplateAccess())
                .durationDays(cmd.durationDays())
                .active(true)
                .free(cmd.free())
                .build();

        CandidateSubscriptionPlan saved = planRepository.save(plan);
        log.info("[CreateCandidatePlan] Created: code={} name={}", saved.getCode(), saved.getName());
        return saved;
    }

    public record Command(
            String code,
            String name,
            String description,
            BigDecimal priceMonthly,
            BigDecimal priceYearly,
            int applicationLimit,
            int cvBoostLimit,
            int cvCreateLimit,
            boolean aiCvWriter,
            boolean premiumTemplateAccess,
            Integer durationDays,
            boolean free) {
    }
}