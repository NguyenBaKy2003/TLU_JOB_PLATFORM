package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.SubscriptionPlanRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * UseCase: Admin cập nhật thông tin gói dịch vụ.
 *
 * Cho phép thay đổi: tên, mô tả, giá, quota, tính năng, trạng thái.
 * KHÔNG cho phép thay đổi code (immutable identifier).
 *
 * Lưu ý: Thay đổi plan KHÔNG ảnh hưởng đến CompanySubscription đang active
 * vì quota đã được snapshot tại thời điểm mua.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateSubscriptionPlanUseCase {

    private final SubscriptionPlanRepository planRepository;

    @Transactional
    public SubscriptionPlan execute(UUID planId, Command cmd) {

        SubscriptionPlan existing = planRepository.findById(planId)
                .orElseThrow(() -> ResourceNotFoundException.of("SubscriptionPlan", planId));

        // Validate giá nếu được cung cấp
        if (cmd.priceMonthly() != null && cmd.priceMonthly().compareTo(BigDecimal.ZERO) < 0)
            throw new BusinessRuleException("Giá theo tháng không hợp lệ.", "INVALID_PRICE");

        if (cmd.priceYearly() != null && cmd.priceYearly().compareTo(BigDecimal.ZERO) < 0)
            throw new BusinessRuleException("Giá theo năm không hợp lệ.", "INVALID_PRICE");

        // Build updated plan — giữ nguyên các field không được truyền vào (null = không
        // đổi)
        SubscriptionPlan updated = SubscriptionPlan.builder()
                .id(existing.getId())
                .code(existing.getCode()) // immutable
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
        log.info("SubscriptionPlan updated: id={} code={}", saved.getId(), saved.getCode());
        return saved;
    }

    /**
     * Tất cả field đều nullable — chỉ update field được truyền vào.
     * Đây là partial update (PATCH semantics).
     */
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
            Boolean active // dùng để deactivate plan cũ
    ) {
    }
}