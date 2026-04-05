package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.shared.event.subscription.PaymentSuccessEvent;
import edu.tlu.jobplatform.shared.event.subscription.SubscriptionActivatedEvent;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.subscription.application.port.out.PaymentGatewayPort;
import edu.tlu.jobplatform.subscription.domain.model.*;
import edu.tlu.jobplatform.subscription.domain.repository.*;
import edu.tlu.jobplatform.subscription.domain.service.SubscriptionDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

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

                log.info("[CALLBACK] Received params: {}", callbackParams);

                // 1. Verify chữ ký — phải là bước đầu tiên
                if (!paymentGateway.verifyCallback(callbackParams)) {
                        throw new BusinessRuleException(
                                        "Chữ ký callback không hợp lệ.", "INVALID_CALLBACK_SIGNATURE");
                }

                // 2. Lấy orderCode
                String orderCode = resolveOrderCode(callbackParams);

                Payment payment = paymentRepository.findByGatewayOrderCode(orderCode)
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Không tìm thấy đơn hàng: " + orderCode, "ORDER_NOT_FOUND"));

                // 3. Idempotency
                if (payment.getStatus() == PaymentStatus.SUCCESS) {
                        log.info("[CALLBACK] Already processed: order={}", orderCode);
                        return;
                }

                CompanySubscription subscription = subscriptionRepository
                                .findById(payment.getSubscriptionId())
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Không tìm thấy subscription.", "SUB_NOT_FOUND"));

                if (paymentGateway.isSuccess(callbackParams))
                        handleSuccess(payment, subscription, callbackParams);
                else
                        handleFailure(payment, subscription, callbackParams);
        }

        private void handleSuccess(Payment payment, CompanySubscription subscription,
                        Map<String, String> params) {
                String transactionId = paymentGateway.extractTransactionId(params);
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
                                subscription.getPlanCode(), payment.getAmount(),
                                paymentGateway.getGatewayName()));

                eventPublisher.publishEvent(new SubscriptionActivatedEvent(
                                subscription.getCompanyId(), null,
                                plan.getName(), subscription.getExpiresAt(),
                                plan.getJobPostLimit(), payment.getId()));

                log.info("[CALLBACK] Activated: company={} plan={} expires={}",
                                subscription.getCompanyId(), subscription.getPlanCode(),
                                subscription.getExpiresAt());
        }

        private void handleFailure(Payment payment, CompanySubscription subscription,
                        Map<String, String> params) {
                String reason = params.getOrDefault("vnp_ResponseCode",
                                params.getOrDefault("resultCode", "UNKNOWN"));
                payment.markFailed(reason);
                subscription.markFailed();
                paymentRepository.save(payment);
                subscriptionRepository.save(subscription);
                log.warn("[CALLBACK] Failed: order={} reason={}", payment.getGatewayOrderCode(), reason);
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