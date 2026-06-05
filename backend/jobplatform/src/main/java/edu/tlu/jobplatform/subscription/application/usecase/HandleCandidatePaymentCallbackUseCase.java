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
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class HandleCandidatePaymentCallbackUseCase extends AbstractPaymentCallbackUseCase {

        @Getter
        private final List<PaymentGatewayPort> gateways;

        private final PaymentRepository paymentRepository;
        private final CandidateSubscriptionRepository subscriptionRepository;
        private final CandidateSubscriptionPlanRepository planRepository;
        private final CandidateSubscriptionDomainService domainService;
        private final ApplicationEventPublisher eventPublisher;

        // ── IPN / callback có signature ───────────────────────────────────────────

        @Transactional
        public void execute(Map<String, String> callbackParams) {
                log.info("[CandidateCallback] Received params: {}", callbackParams);

                PaymentGatewayPort gateway = detectGateway(callbackParams);
                log.info("[CandidateCallback] Gateway detected: {}", gateway.getGatewayName());

                if (!gateway.verifyCallback(callbackParams))
                        throw new BusinessRuleException("Chữ ký callback không hợp lệ.", "INVALID_CALLBACK_SIGNATURE");

                String orderCode = resolveOrderCode(callbackParams);
                Payment payment = findPayment(orderCode);

                if (payment.getStatus() == PaymentStatus.SUCCESS) {
                        log.info("[CandidateCallback] Already processed: order={}", orderCode);
                        return;
                }

                CandidateSubscription subscription = findSubscription(payment);

                if (gateway.isSuccess(callbackParams))
                        handleSuccess(gateway.extractTransactionId(callbackParams), payment, subscription,
                                        gateway.getGatewayName());
                else
                        handleFailure(payment, subscription, callbackParams);
        }

        // ── ZaloPay return URL — không có signature, dùng status=1 làm xác nhận ──

        @Transactional
        public void markSuccessByOrderCode(String orderCode, String zpTransId) {
                log.info("[ZALOPAY-RETURN] markSuccess: orderCode={} zpTransId={}", orderCode, zpTransId);

                Payment payment = findPayment(orderCode);

                if (payment.getStatus() == PaymentStatus.SUCCESS) {
                        log.info("[ZALOPAY-RETURN] Already processed: order={}", orderCode);
                        return;
                }

                CandidateSubscription subscription = findSubscription(payment);
                String transactionId = zpTransId != null ? zpTransId : "ZLP-" + orderCode;

                handleSuccess(transactionId, payment, subscription, "ZALOPAY");
        }

        // ── Shared logic ──────────────────────────────────────────────────────────

        private void handleSuccess(String transactionId,
                        Payment payment,
                        CandidateSubscription subscription,
                        String gatewayName) {
                payment.markSuccess(transactionId);

                CandidateSubscriptionPlan plan = planRepository.findByCode(subscription.getPlanCode())
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Không tìm thấy gói: " + subscription.getPlanCode(), "PLAN_NOT_FOUND"));

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
                                gatewayName));

                log.info("[CandidateCallback] Activated: candidateId={} plan={} expires={} gateway={}",
                                subscription.getCandidateId(), subscription.getPlanCode(),
                                subscription.getExpiresAt(), gatewayName);
        }

        private void handleFailure(Payment payment,
                        CandidateSubscription subscription,
                        Map<String, String> params) {
                String reason = params.getOrDefault("vnp_ResponseCode",
                                params.getOrDefault("resultCode",
                                                params.getOrDefault("return_code", "UNKNOWN")));
                payment.markFailed(reason);
                subscription.markFailed();
                paymentRepository.save(payment);
                subscriptionRepository.save(subscription);
                log.warn("[CandidateCallback] Failed: order={} reason={}",
                                payment.getGatewayOrderCode(), reason);
        }

        private Payment findPayment(String orderCode) {
                return paymentRepository.findByGatewayOrderCode(orderCode)
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Không tìm thấy đơn hàng: " + orderCode, "ORDER_NOT_FOUND"));
        }

        private CandidateSubscription findSubscription(Payment payment) {
                return subscriptionRepository.findById(payment.getSubscriptionId())
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Không tìm thấy subscription.", "SUB_NOT_FOUND"));
        }
}