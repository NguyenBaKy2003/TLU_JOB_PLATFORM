package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import edu.tlu.jobplatform.payment.domain.repository.PaymentRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.subscription.application.port.out.PaymentGatewayPort;
import edu.tlu.jobplatform.subscription.domain.model.CompanySubscription;
import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.CompanySubscriptionRepository;
import edu.tlu.jobplatform.subscription.domain.repository.SubscriptionPlanRepository;
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
        private final CompanyRepository companyRepository;

        @Value("${app.base-url:http://localhost:8080}")
        private String baseUrl;

        @Transactional
        public Result execute(Command cmd) {

                // 1. Validate công ty
                CompanyProfile company = companyRepository.findById(cmd.companyId())
                                .orElseThrow(() -> ResourceNotFoundException.of("Company", cmd.companyId()));

                if (company.getVerificationStatus() != VerificationStatus.VERIFIED)
                        throw new BusinessRuleException(
                                        "Công ty chưa được xác thực. Vui lòng chờ admin duyệt hồ sơ trước khi mua gói.",
                                        "COMPANY_NOT_VERIFIED");

                // 2. Validate plan
                SubscriptionPlan plan = planRepository.findById(cmd.planId())
                                .orElseThrow(() -> ResourceNotFoundException.of("SubscriptionPlan", cmd.planId()));

                if (!plan.isActive())
                        throw new BusinessRuleException(
                                        "Gói dịch vụ này không còn khả dụng.", "PLAN_INACTIVE");

                // 3. Xác định giá
                BigDecimal amount = cmd.yearly() ? plan.getPriceYearly() : plan.getPriceMonthly();
                if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0)
                        throw new BusinessRuleException(
                                        "Gói này không hỗ trợ loại thanh toán đã chọn.", "INVALID_PLAN_PRICE");

                String orderCode = generateOrderCode();

                // 4. Tạo subscription PENDING
                CompanySubscription subscription = domainService.createPending(
                                cmd.companyId(), plan, null, cmd.yearly());
                CompanySubscription savedSubscription = subscriptionRepository.save(subscription);

                // 5. Tạo Payment PENDING — gắn companyId
                Payment payment = Payment.builder()
                                .id(UUID.randomUUID())
                                .companyId(cmd.companyId()) // company payment
                                .candidateId(null)
                                .subscriptionId(savedSubscription.getId())
                                .planCode(plan.getCode())
                                .amount(amount)
                                .currency("VND")
                                .gateway(paymentGateway.getGatewayName())
                                .gatewayOrderCode(orderCode)
                                .status(PaymentStatus.PENDING)
                                .createdAt(LocalDateTime.now())
                                .build();
                paymentRepository.save(payment);

                // 6. Tạo payment URL
                String returnUrl = baseUrl + "/api/v1/payments/callback/vnpay/return";
                String description = "Mua " + plan.getName() + " - "
                                + cmd.companyId().toString().substring(0, 8);
                String paymentUrl = paymentGateway.createPaymentUrl(
                                orderCode, amount, description, returnUrl);

                log.info("[CompanyPurchase] Initiated: companyId={} plan={} order={} subscription={} yearly={}",
                                cmd.companyId(), plan.getCode(), orderCode, savedSubscription.getId(), cmd.yearly());

                return new Result(payment.getId(), savedSubscription.getId(), paymentUrl, orderCode);
        }

        private String generateOrderCode() {
                return "JP-" + UUID.randomUUID().toString()
                                .replace("-", "").substring(0, 8).toUpperCase();
        }

        public record Command(UUID companyId, UUID planId, boolean yearly) {
        }

        public record Result(UUID paymentId, UUID subscriptionId,
                        String paymentUrl, String orderCode) {
        }
}