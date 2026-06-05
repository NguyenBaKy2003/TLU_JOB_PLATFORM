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
import java.util.Map;
import java.util.UUID;

/**
 * UseCase: Candidate mua gói dịch vụ.
 *
 * Flow:
 * 1. Validate plan tồn tại, đang active, không phải gói free
 * 2. Xác định giá (monthly / yearly)
 * 3. Tạo CandidateSubscription PENDING
 * 4. Tạo Payment PENDING — gắn candidateId (KHÔNG dùng companyId)
 * 5. Gọi PaymentGateway tạo URL (gateway được chọn từ Command)
 * 6. Trả về paymentUrl để frontend redirect
 *
 * OrderCode prefix "CP-" để PaymentController phân biệt với Company ("JP-").
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PurchaseCandidatePlanUseCase {

        private final CandidateSubscriptionPlanRepository planRepository;
        private final CandidateSubscriptionRepository subscriptionRepository;
        private final PaymentRepository paymentRepository;
        private final CandidateSubscriptionDomainService domainService;

        /**
         * Spring injects all PaymentGatewayPort beans by bean name:
         * "vnpayGatewayAdapter", "momoGatewayAdapter", "zaloPayGatewayAdapter"
         */
        private final Map<String, PaymentGatewayPort> gatewayAdapters;

        @Value("${app.base-url:http://localhost:8080}")
        private String baseUrl;

        @Transactional
        public Result execute(Command cmd) {

                // 1. Validate plan
                CandidateSubscriptionPlan plan = planRepository.findById(cmd.planId())
                                .orElseThrow(() -> ResourceNotFoundException.of(
                                                "CandidateSubscriptionPlan", cmd.planId()));

                if (!plan.isActive())
                        throw new BusinessRuleException(
                                        "Gói dịch vụ này không còn khả dụng.", "PLAN_INACTIVE");

                if (plan.isFree())
                        throw new BusinessRuleException(
                                        "Gói FREE_CANDIDATE miễn phí không cần thanh toán.", "PLAN_IS_FREE");

                // 2. Xác định giá
                BigDecimal amount = cmd.yearly() ? plan.getPriceYearly() : plan.getPriceMonthly();
                if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0)
                        throw new BusinessRuleException(
                                        "Gói này không hỗ trợ loại thanh toán đã chọn.", "INVALID_PLAN_PRICE");

                String orderCode = generateOrderCode();

                // 3. Resolve gateway theo tên được chọn
                PaymentGatewayPort gateway = resolveGateway(cmd.gateway());

                // 4. Tạo subscription PENDING
                CandidateSubscription subscription = domainService.createPending(
                                cmd.candidateId(), plan, null, cmd.yearly());
                CandidateSubscription saved = subscriptionRepository.save(subscription);

                // 5. Tạo Payment PENDING — gắn candidateId, lưu đúng tên gateway
                Payment payment = Payment.builder()
                                .id(UUID.randomUUID())
                                .candidateId(cmd.candidateId())
                                .companyId(null)
                                .subscriptionId(saved.getId())
                                .planCode(plan.getCode())
                                .amount(amount)
                                .currency("VND")
                                .gateway(gateway.getGatewayName()) // lưu đúng tên cổng
                                .gatewayOrderCode(orderCode)
                                .status(PaymentStatus.PENDING)
                                .createdAt(LocalDateTime.now())
                                .build();
                paymentRepository.save(payment);

                // 6. Tạo payment URL
                String returnUrl = buildReturnUrl(gateway.getGatewayName());
                String description = "Mua " + plan.getName() + " - "
                                + cmd.candidateId().toString().substring(0, 8);
                String paymentUrl = gateway.createPaymentUrl(orderCode, amount, description, returnUrl);

                log.info("[CandidatePurchase] Initiated: candidateId={} plan={} order={} subscription={} yearly={} gateway={}",
                                cmd.candidateId(), plan.getCode(), orderCode, saved.getId(),
                                cmd.yearly(), gateway.getGatewayName());

                return new Result(payment.getId(), saved.getId(), paymentUrl, orderCode);
        }

        // ── Helpers ──────────────────────────────────────────────────────────────

        private PaymentGatewayPort resolveGateway(String gatewayName) {
                if (gatewayName == null || gatewayName.isBlank())
                        gatewayName = "VNPAY";
                return switch (gatewayName.toUpperCase()) {
                        case "MOMO" -> gatewayAdapters.getOrDefault("momoGatewayAdapter", primaryGateway());
                        case "ZALOPAY" -> gatewayAdapters.getOrDefault("zaloPayGatewayAdapter", primaryGateway());
                        default -> primaryGateway(); // VNPAY
                };
        }

        private PaymentGatewayPort primaryGateway() {
                return gatewayAdapters.values().stream()
                                .filter(g -> g.getGatewayName().equals("VNPAY"))
                                .findFirst()
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Không tìm thấy cổng thanh toán mặc định.", "GATEWAY_NOT_FOUND"));
        }

        private String buildReturnUrl(String gatewayName) {
                return switch (gatewayName.toUpperCase()) {
                        case "MOMO" -> baseUrl + "/api/v1/payments/callback/momo/return";
                        case "ZALOPAY" -> baseUrl + "/api/v1/payments/callback/zalopay/return";
                        default -> baseUrl + "/api/v1/payments/callback/vnpay/return";
                };
        }

        private String generateOrderCode() {
                return "CP-" + UUID.randomUUID().toString()
                                .replace("-", "").substring(0, 8).toUpperCase();
        }

        // ── Command / Result ─────────────────────────────────────────────────────

        /**
         * @param candidateId userId của Candidate
         * @param planId      id của CandidateSubscriptionPlan
         * @param yearly      true = gói năm, false = gói tháng
         * @param gateway     "VNPAY" | "MOMO" | "ZALOPAY" — null → default VNPAY
         */
        public record Command(UUID candidateId, UUID planId, boolean yearly, String gateway) {
        }

        public record Result(UUID paymentId, UUID subscriptionId,
                        String paymentUrl, String orderCode) {
        }
}