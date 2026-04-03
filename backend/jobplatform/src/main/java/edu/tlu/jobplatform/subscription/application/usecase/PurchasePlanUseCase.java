package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.subscription.application.port.out.PaymentGatewayPort;
import edu.tlu.jobplatform.subscription.domain.model.*;
import edu.tlu.jobplatform.subscription.domain.repository.*;
import edu.tlu.jobplatform.subscription.domain.service.SubscriptionDomainService;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * UseCase: Mua gói dịch vụ.
 *
 * Flow:
 * 1. Validate plan tồn tại và active
 * 2. Tạo Payment record (PENDING)
 * 3. Tạo CompanySubscription (PENDING)
 * 4. Gọi gateway tạo payment URL
 * 5. Trả URL cho frontend redirect
 *
 * Khi user thanh toán xong → gateway callback → HandlePaymentCallbackUseCase
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PurchasePlanUseCase {

        private final SubscriptionPlanRepository planRepository;
        private final CompanySubscriptionRepository subscriptionRepository;
        private final PaymentRepository paymentRepository;
        private final SubscriptionDomainService domainService;
        private final PaymentGatewayPort paymentGateway;

        @Value("${app.base-url:http://localhost:8080}")
        private String baseUrl;

        @Transactional
        public Result execute(Command cmd) {

                // 1. Validate plan
                SubscriptionPlan plan = planRepository.findById(cmd.planId())
                                .orElseThrow(() -> ResourceNotFoundException.of("SubscriptionPlan", cmd.planId()));

                if (!plan.isActive())
                        throw new BusinessRuleException("Gói dịch vụ này không còn khả dụng.", "PLAN_INACTIVE");

                // 2. Tạo Payment (PENDING)
                String orderCode = "JP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                Payment payment = Payment.builder()
                                .id(UUID.randomUUID())
                                .companyId(cmd.userId())
                                .planCode(plan.getCode())
                                .amount(cmd.yearly() ? plan.getPriceYearly() : plan.getPriceMonthly())
                                .currency("VND")
                                .gateway(paymentGateway.getGatewayName())
                                .gatewayOrderCode(orderCode)
                                .status(PaymentStatus.PENDING)
                                .createdAt(LocalDateTime.now())
                                .build();
                paymentRepository.save(payment);

                // 3. Tạo Subscription (PENDING) — subscriptionId nhúng vào orderCode
                CompanySubscription subscription = domainService.createPending(
                                cmd.userId(), plan, payment.getId());
                subscriptionRepository.save(subscription);

                // 4. Tạo payment URL
                String returnUrl = baseUrl + "/api/v1/payments/callback/"
                                + paymentGateway.getGatewayName().toLowerCase();
                String description = "Mua " + plan.getName() + " - " + cmd.userId().toString().substring(0, 8);
                String paymentUrl = paymentGateway.createPaymentUrl(
                                orderCode, payment.getAmount(), description, returnUrl);

                log.info("Payment initiated: company={} plan={} order={}", cmd.userId(), plan.getCode(), orderCode);

                return new Result(payment.getId(), subscription.getId(), paymentUrl, orderCode);
        }

        public record Command(UUID userId, UUID planId, boolean yearly) {
        }

        public record Result(UUID paymentId, UUID subscriptionId, String paymentUrl, String orderCode) {
        }
}