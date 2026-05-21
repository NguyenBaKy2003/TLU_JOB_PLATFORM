package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import edu.tlu.jobplatform.payment.domain.repository.PaymentRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.subscription.application.port.out.PaymentGatewayPort;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscription;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionPlanRepository;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionRepository;
import edu.tlu.jobplatform.subscription.domain.service.CandidateSubscriptionDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * UseCase: Candidate mua gói dịch vụ.
 *
 * Flow:
 * 1. Validate plan tồn tại, đang active, không phải gói free
 * 2. Tạo CandidateSubscription PENDING — snapshot quota từ plan
 * 3. Tạo Payment PENDING liên kết subscriptionId
 * 4. Gọi PaymentGateway tạo URL thanh toán
 * 5. Trả về paymentUrl để frontend redirect
 *
 * Tái sử dụng PaymentGatewayPort và PaymentRepository từ Company module —
 * bảng payments dùng chung, phân biệt bằng planCode prefix.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PurchaseCandidatePlanUseCase {

    private final CandidateSubscriptionPlanRepository planRepository;
    private final CandidateSubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final CandidateSubscriptionDomainService domainService;
    private final PaymentGatewayPort paymentGateway;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Transactional
    public Result execute(Command cmd) {

        // 1. Validate plan
        CandidateSubscriptionPlan plan = planRepository.findById(cmd.planId())
                .orElseThrow(() -> ResourceNotFoundException.of("CandidateSubscriptionPlan", cmd.planId()));

        if (!plan.isActive())
            throw new BusinessRuleException(
                    "Gói dịch vụ này không còn khả dụng.", "PLAN_INACTIVE");

        if (plan.isFree())
            throw new BusinessRuleException(
                    "Gói BASIC miễn phí không cần thanh toán.", "PLAN_IS_FREE");

        // 2. Xác định giá theo loại (monthly/yearly)
        BigDecimal amount = cmd.yearly() ? plan.getPriceYearly() : plan.getPriceMonthly();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0)
            throw new BusinessRuleException(
                    "Gói này không hỗ trợ loại thanh toán đã chọn.", "INVALID_PLAN_PRICE");

        String orderCode = generateOrderCode();

        // 3. Tạo và lưu subscription PENDING
        CandidateSubscription subscription = domainService.createPending(
                cmd.candidateId(), plan, null, cmd.yearly());
        CandidateSubscription saved = subscriptionRepository.save(subscription);

        // 4. Tạo Payment liên kết subscriptionId đã persist
        Payment payment = Payment.builder()
                .id(UUID.randomUUID())
                .companyId(cmd.candidateId()) // reuse companyId field cho candidateId
                .subscriptionId(saved.getId())
                .planCode(plan.getCode())
                .amount(amount)
                .currency("VND")
                .gateway(paymentGateway.getGatewayName())
                .gatewayOrderCode(orderCode)
                .status(PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        // 5. Tạo payment URL
        String returnUrl = baseUrl + "/api/v1/payments/callback/vnpay/return";
        String description = "Mua " + plan.getName() + " - "
                + cmd.candidateId().toString().substring(0, 8);
        String paymentUrl = paymentGateway.createPaymentUrl(
                orderCode, amount, description, returnUrl);

        log.info("[CandidatePurchase] Initiated: candidateId={} plan={} order={} subscription={} yearly={}",
                cmd.candidateId(), plan.getCode(), orderCode, saved.getId(), cmd.yearly());

        return new Result(payment.getId(), saved.getId(), paymentUrl, orderCode);
    }

    private String generateOrderCode() {
        return "CP-" + UUID.randomUUID().toString()
                .replace("-", "").substring(0, 8).toUpperCase();
    }

    /**
     * @param candidateId userId của Candidate (không phải companyId)
     * @param planId      id của CandidateSubscriptionPlan
     * @param yearly      true = gói năm, false = gói tháng
     */
    public record Command(UUID candidateId, UUID planId, boolean yearly) {
    }

    public record Result(UUID paymentId, UUID subscriptionId,
            String paymentUrl, String orderCode) {
    }
}