package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import edu.tlu.jobplatform.payment.domain.repository.PaymentRepository;
import edu.tlu.jobplatform.shared.event.subscription.CandidateSubscriptionActivatedEvent;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.subscription.application.port.out.PaymentGatewayPort;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscription;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionPlanRepository;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionRepository;
import edu.tlu.jobplatform.subscription.domain.service.CandidateSubscriptionDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * UseCase: Xử lý callback thanh toán từ VNPay cho Candidate.
 *
 * Tái sử dụng toàn bộ PaymentGatewayPort, PaymentRepository từ Company.
 * Phân biệt với HandlePaymentCallbackUseCase (Company) bằng orderCode prefix:
 * - Company → "JP-XXXXXXXX"
 * - Candidate → "CP-XXXXXXXX"
 *
 * Routing được thực hiện ở PaymentController dựa trên prefix này.
 *
 * Flow:
 * 1. Verify chữ ký callback
 * 2. Resolve orderCode → Payment → CandidateSubscription
 * 3. Idempotency check (đã xử lý rồi thì skip)
 * 4. handleSuccess / handleFailure
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HandleCandidatePaymentCallbackUseCase {

    private final PaymentGatewayPort paymentGateway;
    private final PaymentRepository paymentRepository;
    private final CandidateSubscriptionRepository subscriptionRepository;
    private final CandidateSubscriptionPlanRepository planRepository;
    private final CandidateSubscriptionDomainService domainService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void execute(Map<String, String> callbackParams) {

        log.info("[CandidateCallback] Received params: {}", callbackParams);

        // 1. Verify chữ ký — bước đầu tiên, bắt buộc
        if (!paymentGateway.verifyCallback(callbackParams))
            throw new BusinessRuleException(
                    "Chữ ký callback không hợp lệ.", "INVALID_CALLBACK_SIGNATURE");

        // 2. Resolve orderCode → Payment
        String orderCode = resolveOrderCode(callbackParams);

        Payment payment = paymentRepository.findByGatewayOrderCode(orderCode)
                .orElseThrow(() -> new BusinessRuleException(
                        "Không tìm thấy đơn hàng: " + orderCode, "ORDER_NOT_FOUND"));

        // 3. Idempotency — đã xử lý rồi thì bỏ qua
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            log.info("[CandidateCallback] Already processed: order={}", orderCode);
            return;
        }

        // 4. Resolve CandidateSubscription
        CandidateSubscription subscription = subscriptionRepository
                .findById(payment.getSubscriptionId())
                .orElseThrow(() -> new BusinessRuleException(
                        "Không tìm thấy subscription.", "SUB_NOT_FOUND"));

        if (paymentGateway.isSuccess(callbackParams))
            handleSuccess(payment, subscription, callbackParams);
        else
            handleFailure(payment, subscription, callbackParams);
    }

    private void handleSuccess(Payment payment, CandidateSubscription subscription,
            Map<String, String> params) {

        String transactionId = paymentGateway.extractTransactionId(params);
        payment.markSuccess(transactionId);

        CandidateSubscriptionPlan plan = planRepository.findByCode(subscription.getPlanCode())
                .orElseThrow(() -> new BusinessRuleException(
                        "Không tìm thấy gói: " + subscription.getPlanCode(), "PLAN_NOT_FOUND"));

        // Tìm subscription ACTIVE hiện tại (nếu có) để carry-over days
        CandidateSubscription existingActive = subscriptionRepository
                .findActiveByCandidate(subscription.getCandidateId())
                .filter(s -> !s.getId().equals(subscription.getId()))
                .orElse(null);

        domainService.activate(subscription, plan, payment, existingActive);

        paymentRepository.save(payment);
        subscriptionRepository.save(subscription);
        if (existingActive != null)
            subscriptionRepository.save(existingActive);

        eventPublisher.publishEvent(new CandidateSubscriptionActivatedEvent(
                subscription.getCandidateId(),
                plan.getName(),
                subscription.getExpiresAt(),
                payment.getId(),
                payment.getAmount(),
                paymentGateway.getGatewayName()));

        log.info("[CandidateCallback] Activated: candidateId={} plan={} expires={}",
                subscription.getCandidateId(), subscription.getPlanCode(),
                subscription.getExpiresAt());
    }

    private void handleFailure(Payment payment, CandidateSubscription subscription,
            Map<String, String> params) {
        String reason = params.getOrDefault("vnp_ResponseCode",
                params.getOrDefault("resultCode", "UNKNOWN"));
        payment.markFailed(reason);
        subscription.markFailed();
        paymentRepository.save(payment);
        subscriptionRepository.save(subscription);
        log.warn("[CandidateCallback] Failed: order={} reason={}",
                payment.getGatewayOrderCode(), reason);
    }

    private String resolveOrderCode(Map<String, String> params) {
        String code = params.get("vnp_TxnRef");
        if (code == null || code.isBlank())
            code = params.get("orderId");
        if (code == null || code.isBlank())
            throw new BusinessRuleException(
                    "Không tìm thấy orderCode trong callback.", "MISSING_ORDER_CODE");
        return code;
    }
}