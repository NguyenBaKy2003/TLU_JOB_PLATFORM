package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.subscription.application.port.out.PaymentGatewayPort;
import edu.tlu.jobplatform.subscription.domain.model.*;
import edu.tlu.jobplatform.subscription.domain.repository.*;
import edu.tlu.jobplatform.subscription.domain.service.SubscriptionDomainService;
import edu.tlu.jobplatform.shared.event.subscription.PaymentSuccessEvent;
import edu.tlu.jobplatform.shared.event.subscription.SubscriptionActivatedEvent;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * UseCase: Xử lý callback từ cổng thanh toán (webhook).
 *
 * Flow:
 * 1. Xác minh chữ ký từ gateway (tránh giả mạo)
 * 2. Tìm Payment theo orderCode
 * 3. Nếu success: activate subscription, fire events
 * 4. Nếu failed: cập nhật Payment + Subscription status
 *
 * Security: KHÔNG cần JWT auth — gateway gọi trực tiếp.
 * Bảo mật bằng HMAC signature verification.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HandlePaymentCallbackUseCase {

    private final PaymentGatewayPort paymentGateway;
    private final PaymentRepository paymentRepository;
    private final CompanySubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionDomainService domainService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void execute(Map<String, String> callbackParams) {
        // 1. Verify signature — từ chối nếu không hợp lệ
        if (!paymentGateway.verifyCallback(callbackParams)) {
            log.warn("Invalid payment callback signature: {}", callbackParams);
            throw new BusinessRuleException(
                    "Chữ ký callback không hợp lệ.", "INVALID_CALLBACK_SIGNATURE");
        }

        // 2. Tìm Payment
        final String orderCode = callbackParams.get("vnp_TxnRef") != null
                ? callbackParams.get("vnp_TxnRef")
                : callbackParams.get("orderId");

        Payment payment = paymentRepository.findByGatewayOrderCode(orderCode)
                .orElseThrow(() -> new BusinessRuleException(
                        "Không tìm thấy đơn hàng: " + orderCode, "ORDER_NOT_FOUND"));

        // Idempotency — nếu đã xử lý rồi thì bỏ qua
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            log.info("Callback already processed for order: {}", orderCode);
            return;
        }

        CompanySubscription subscription = subscriptionRepository
                .findById(payment.getSubscriptionId())
                .orElseThrow(() -> new BusinessRuleException("Subscription not found", "SUB_NOT_FOUND"));

        if (paymentGateway.isSuccess(callbackParams)) {
            // 3a. Thanh toán thành công
            String transactionId = paymentGateway.extractTransactionId(callbackParams);
            payment.markSuccess(transactionId);

            SubscriptionPlan plan = planRepository.findByCode(subscription.getPlanCode())
                    .orElseThrow(() -> new BusinessRuleException("Plan not found", "PLAN_NOT_FOUND"));

            // Kiểm tra có subscription cũ đang active không (để cộng thêm ngày)
            CompanySubscription existing = subscriptionRepository
                    .findActiveByCompanyId(subscription.getCompanyId())
                    .filter(s -> !s.getId().equals(subscription.getId()))
                    .orElse(null);

            domainService.activate(subscription, plan, payment, existing);

            paymentRepository.save(payment);
            subscriptionRepository.save(subscription);
            if (existing != null)
                subscriptionRepository.save(existing);

            // Fire events → Notification + Audit
            eventPublisher.publishEvent(new PaymentSuccessEvent(
                    payment.getId(), subscription.getCompanyId(),
                    subscription.getPlanCode(), payment.getAmount(), paymentGateway.getGatewayName()));

            eventPublisher.publishEvent(new SubscriptionActivatedEvent(
                    subscription.getCompanyId(),
                    null,
                    plan.getName(),
                    subscription.getExpiresAt(),
                    plan.getJobPostLimit(),
                    payment.getId()));
            log.info("Subscription activated: company={} plan={} expires={}",
                    subscription.getCompanyId(), subscription.getPlanCode(), subscription.getExpiresAt());

        } else {
            // 3b. Thanh toán thất bại
            String reason = callbackParams.getOrDefault("vnp_ResponseCode", "UNKNOWN");
            payment.markFailed(reason);
            subscription.markFailed();

            paymentRepository.save(payment);
            subscriptionRepository.save(subscription);

            log.warn("Payment failed: order={} reason={}", orderCode, reason);
        }
    }
}