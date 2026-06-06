package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import edu.tlu.jobplatform.payment.domain.repository.PaymentRepository;
import edu.tlu.jobplatform.shared.event.subscription.PaymentSuccessEvent;
import edu.tlu.jobplatform.shared.event.subscription.SubscriptionActivatedEvent;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.subscription.application.port.out.PaymentGatewayPort;
import edu.tlu.jobplatform.subscription.domain.model.*;
import edu.tlu.jobplatform.subscription.domain.repository.*;
import edu.tlu.jobplatform.subscription.domain.service.SubscriptionDomainService;
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
public class HandlePaymentCallbackUseCase extends AbstractPaymentCallbackUseCase {

        @Getter
        private final List<PaymentGatewayPort> gateways;

        private final PaymentRepository paymentRepository;
        private final CompanySubscriptionRepository subscriptionRepository;
        private final SubscriptionPlanRepository planRepository;
        private final SubscriptionDomainService domainService;
        private final ApplicationEventPublisher eventPublisher;

        // ── IPN / callback có signature ───────────────────────────────────────────

        @Transactional
        public void execute(Map<String, String> callbackParams) {
                log.info("[CALLBACK] Received params: {}", callbackParams);

                PaymentGatewayPort gateway = detectGateway(callbackParams);
                log.info("[CALLBACK] Gateway detected: {}", gateway.getGatewayName());

                if (!gateway.verifyCallback(callbackParams))
                        throw new BusinessRuleException("Chữ ký callback không hợp lệ.", "INVALID_CALLBACK_SIGNATURE");

                String orderCode = resolveOrderCode(callbackParams);
                Payment payment = findPayment(orderCode);

                if (payment.getStatus() == PaymentStatus.SUCCESS) {
                        log.info("[CALLBACK] Already processed: order={}", orderCode);
                        return;
                }

                CompanySubscription subscription = findSubscription(payment);

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

                CompanySubscription subscription = findSubscription(payment);
                String transactionId = zpTransId != null ? zpTransId : "ZLP-" + orderCode;

                handleSuccess(transactionId, payment, subscription, "ZALOPAY");
        }

        // ── Shared logic ──────────────────────────────────────────────────────────

        private void handleSuccess(String transactionId,
                        Payment payment,
                        CompanySubscription subscription,
                        String gatewayName) {
                payment.markSuccess(transactionId);

                SubscriptionPlan plan = planRepository.findByCode(subscription.getPlanCode())
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Không tìm thấy gói: " + subscription.getPlanCode(), "PLAN_NOT_FOUND"));

                CompanySubscription existingActive = subscriptionRepository
                                .findActiveByCompanyId(subscription.getCompanyId())
                                .filter(s -> !s.getId().equals(subscription.getId()))
                                .orElse(null);

                domainService.activate(subscription, plan, payment, existingActive);

                paymentRepository.save(payment);
                subscriptionRepository.save(subscription);
                if (existingActive != null)
                        subscriptionRepository.save(existingActive);

                eventPublisher.publishEvent(new PaymentSuccessEvent(
                                payment.getId(), subscription.getCompanyId(),
                                subscription.getPlanCode(), payment.getAmount(), gatewayName));

                eventPublisher.publishEvent(new SubscriptionActivatedEvent(
                                subscription.getCompanyId(), null,
                                plan.getName(), subscription.getExpiresAt(),
                                plan.getJobPostLimit(), payment.getId()));

                log.info("[CALLBACK] Activated: company={} plan={} expires={} gateway={}",
                                subscription.getCompanyId(), subscription.getPlanCode(),
                                subscription.getExpiresAt(), gatewayName);
        }

        private void handleFailure(Payment payment,
                        CompanySubscription subscription,
                        Map<String, String> params) {
                String reason = params.getOrDefault("vnp_ResponseCode",
                                params.getOrDefault("resultCode",
                                                params.getOrDefault("return_code", "UNKNOWN")));
                payment.markFailed(reason);
                subscription.markFailed();
                paymentRepository.save(payment);
                subscriptionRepository.save(subscription);
                log.warn("[CALLBACK] Failed: order={} reason={}", payment.getGatewayOrderCode(), reason);
        }

        private Payment findPayment(String orderCode) {
                return paymentRepository.findByGatewayOrderCode(orderCode)
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Không tìm thấy đơn hàng: " + orderCode, "ORDER_NOT_FOUND"));
        }

        private CompanySubscription findSubscription(Payment payment) {
                return subscriptionRepository.findById(payment.getSubscriptionId())
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Không tìm thấy subscription.", "SUB_NOT_FOUND"));
        }
}