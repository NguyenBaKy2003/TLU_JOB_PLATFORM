package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.SubscriptionPlanRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * UseCase: Admin tạo gói dịch vụ mới.
 *
 * Validation:
 * - code phải unique (không trùng plan đã có)
 * - priceMonthly và priceYearly phải > 0
 * - jobPostLimit >= -1 (-1 = unlimited)
 * - durationDays phải là 30 hoặc 365
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CreateSubscriptionPlanUseCase {

    private final SubscriptionPlanRepository planRepository;

    @Transactional
    public SubscriptionPlan execute(Command cmd) {

        // 1. Kiểm tra code unique
        planRepository.findByCode(cmd.code().toUpperCase()).ifPresent(existing -> {
            throw new BusinessRuleException(
                    "Gói dịch vụ với code '" + cmd.code() + "' đã tồn tại.",
                    "PLAN_CODE_DUPLICATE");
        });

        // 2. Validate giá
        if (cmd.priceMonthly() == null || cmd.priceMonthly().compareTo(BigDecimal.ZERO) < 0)
            throw new BusinessRuleException("Giá theo tháng không hợp lệ.", "INVALID_PRICE");

        if (cmd.priceYearly() == null || cmd.priceYearly().compareTo(BigDecimal.ZERO) < 0)
            throw new BusinessRuleException("Giá theo năm không hợp lệ.", "INVALID_PRICE");

        // 3. Validate quota limits
        if (cmd.jobPostLimit() < -1)
            throw new BusinessRuleException("jobPostLimit phải >= -1 (-1 = unlimited).", "INVALID_QUOTA");

        if (cmd.featuredJobLimit() < 0)
            throw new BusinessRuleException("featuredJobLimit phải >= 0.", "INVALID_QUOTA");

        if (cmd.cvViewLimit() < -1)
            throw new BusinessRuleException("cvViewLimit phải >= -1 (-1 = unlimited).", "INVALID_QUOTA");

        // 4. Validate duration
        if (cmd.durationDays() != 30 && cmd.durationDays() != 365)
            throw new BusinessRuleException("durationDays chỉ được là 30 (monthly) hoặc 365 (yearly).",
                    "INVALID_DURATION");

        // 5. Tạo plan
        SubscriptionPlan plan = SubscriptionPlan.builder()
                .code(cmd.code().toUpperCase().trim())
                .name(cmd.name().trim())
                .description(cmd.description())
                .priceMonthly(cmd.priceMonthly())
                .priceYearly(cmd.priceYearly())
                .jobPostLimit(cmd.jobPostLimit())
                .featuredJobLimit(cmd.featuredJobLimit())
                .cvViewLimit(cmd.cvViewLimit())
                .aiFeatures(cmd.aiFeatures())
                .analyticsAccess(cmd.analyticsAccess())
                .durationDays(cmd.durationDays())
                .active(true)
                .build();

        SubscriptionPlan saved = planRepository.save(plan);
        log.info("SubscriptionPlan created: code={} name={}", saved.getCode(), saved.getName());
        return saved;
    }

    public record Command(
            String code, // "STARTER", "BUSINESS", "ENTERPRISE"
            String name, // "Gói Starter"
            String description,
            BigDecimal priceMonthly,
            BigDecimal priceYearly,
            int jobPostLimit, // -1 = unlimited
            int featuredJobLimit,
            int cvViewLimit, // -1 = unlimited
            boolean aiFeatures,
            boolean analyticsAccess,
            int durationDays // 30 hoặc 365
    ) {
    }
}