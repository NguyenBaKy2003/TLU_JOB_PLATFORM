package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.subscription.application.port.out.PaymentGatewayPort;
import edu.tlu.jobplatform.subscription.domain.model.*;
import edu.tlu.jobplatform.subscription.domain.repository.*;
import edu.tlu.jobplatform.subscription.domain.service.SubscriptionDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

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

                SubscriptionPlan plan = planRepository.findById(cmd.planId())
                                .orElseThrow(() -> ResourceNotFoundException.of("SubscriptionPlan", cmd.planId()));

                if (!plan.isActive())
                        throw new BusinessRuleException("Gói dịch vụ này không còn khả dụng.", "PLAN_INACTIVE");

                // Guard: tránh tạo 2 đơn PENDING cùng lúc
                paymentRepository.findPendingByCompanyId(cmd.userId()).ifPresent(p -> {
                        throw new BusinessRuleException(
                                        "Bạn đang có đơn hàng chờ thanh toán: " + p.getGatewayOrderCode()
                                                        + ". Vui lòng hoàn tất hoặc chờ đơn hết hạn.",
                                        "PENDING_ORDER_EXISTS");
                });

                BigDecimal amount = cmd.yearly() ? plan.getPriceYearly() : plan.getPriceMonthly();
                String orderCode = generateOrderCode();
                // returnUrl raw — KHÔNG encode ở đây, adapter sẽ encode đúng 1 lần
                String returnUrl = baseUrl + "/api/v1/payments/callback/vnpay/return";
                String description = "Mua " + plan.getName() + " - "
                                + cmd.userId().toString().substring(0, 8);

                Payment payment = Payment.builder()
                                .id(UUID.randomUUID())
                                .companyId(cmd.userId())
                                .planCode(plan.getCode())
                                .amount(amount)
                                .currency("VND")
                                .gateway(paymentGateway.getGatewayName())
                                .gatewayOrderCode(orderCode)
                                .status(PaymentStatus.PENDING)
                                .createdAt(LocalDateTime.now())
                                .build();
                paymentRepository.save(payment);

                CompanySubscription subscription = domainService.createPending(
                                cmd.userId(), plan, payment.getId());
                subscriptionRepository.save(subscription);

                String paymentUrl = paymentGateway.createPaymentUrl(
                                orderCode, amount, description, returnUrl);

                log.info("Payment initiated: company={} plan={} order={}",
                                cmd.userId(), plan.getCode(), orderCode);

                return new Result(payment.getId(), subscription.getId(), paymentUrl, orderCode);
        }

        /** JP- + timestamp 8 ký tự + random 4 ký tự — tránh trùng */
        private String generateOrderCode() {
                String ts = String.valueOf(System.currentTimeMillis()).substring(5, 13);
                String uid = UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase();
                return "JP-" + ts + uid;
        }

        public record Command(UUID userId, UUID planId, boolean yearly) {
        }

        public record Result(UUID paymentId, UUID subscriptionId,
                        String paymentUrl, String orderCode) {
        }
}