package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * UseCase: Admin cập nhật gói dịch vụ Candidate (PATCH semantics).
 *
 * Tất cả field đều nullable — chỉ update field được truyền vào.
 * code là immutable — không được thay đổi sau khi tạo.
 *
 * Thay đổi plan KHÔNG ảnh hưởng CandidateSubscription đang active
 * vì quota đã được snapshot tại thời điểm mua.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateCandidatePlanUseCase {

    private final CandidateSubscriptionPlanRepository planRepository;

    @Transactional
    public CandidateSubscriptionPlan execute(UUID planId, Command cmd) {

        CandidateSubscriptionPlan existing = planRepository.findById(planId)
                .orElseThrow(() -> ResourceNotFoundException.of("CandidateSubscriptionPlan", planId));

        // Validate giá nếu được truyền vào
        if (cmd.priceMonthly() != null && cmd.priceMonthly().compareTo(BigDecimal.ZERO) < 0)
            throw new BusinessRuleException("Giá theo tháng không hợp lệ.", "INVALID_PRICE");
        if (cmd.priceYearly() != null && cmd.priceYearly().compareTo(BigDecimal.ZERO) < 0)
            throw new BusinessRuleException("Giá theo năm không hợp lệ.", "INVALID_PRICE");

        CandidateSubscriptionPlan updated = CandidateSubscriptionPlan.builder()
                .id(existing.getId())
                .code(existing.getCode()) // immutable
                .free(existing.isFree()) // immutable — không cho đổi free flag sau khi tạo
                .name(cmd.name() != null ? cmd.name().trim() : existing.getName())
                .description(cmd.description() != null ? cmd.description() : existing.getDescription())
                .priceMonthly(cmd.priceMonthly() != null ? cmd.priceMonthly() : existing.getPriceMonthly())
                .priceYearly(cmd.priceYearly() != null ? cmd.priceYearly() : existing.getPriceYearly())
                .applicationLimit(
                        cmd.applicationLimit() != null ? cmd.applicationLimit() : existing.getApplicationLimit())
                .cvBoostLimit(cmd.cvBoostLimit() != null ? cmd.cvBoostLimit() : existing.getCvBoostLimit())
                .jobAlertLimit(cmd.jobAlertLimit() != null ? cmd.jobAlertLimit() : existing.getJobAlertLimit())
                .mockInterviewLimit(
                        cmd.mockInterviewLimit() != null ? cmd.mockInterviewLimit() : existing.getMockInterviewLimit())
                .aiCvWriter(cmd.aiCvWriter() != null ? cmd.aiCvWriter() : existing.isAiCvWriter())
                .salaryInsights(cmd.salaryInsights() != null ? cmd.salaryInsights() : existing.isSalaryInsights())
                .profileAnalytics(
                        cmd.profileAnalytics() != null ? cmd.profileAnalytics() : existing.isProfileAnalytics())
                .advancedFilters(cmd.advancedFilters() != null ? cmd.advancedFilters() : existing.isAdvancedFilters())
                .durationDays(cmd.durationDays() != null ? cmd.durationDays() : existing.getDurationDays())
                .active(cmd.active() != null ? cmd.active() : existing.isActive())
                .build();

        CandidateSubscriptionPlan saved = planRepository.save(updated);
        log.info("[UpdateCandidatePlan] Updated: id={} code={}", saved.getId(), saved.getCode());
        return saved;
    }

    public record Command(
            String name,
            String description,
            BigDecimal priceMonthly,
            BigDecimal priceYearly,
            Integer applicationLimit,
            Integer cvBoostLimit,
            Integer jobAlertLimit,
            Integer mockInterviewLimit,
            Boolean aiCvWriter,
            Boolean salaryInsights,
            Boolean profileAnalytics,
            Boolean advancedFilters,
            Integer durationDays,
            Boolean active) {
    }
}