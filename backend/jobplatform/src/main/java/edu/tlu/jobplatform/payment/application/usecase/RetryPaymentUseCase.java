package edu.tlu.jobplatform.payment.application.usecase;

import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import edu.tlu.jobplatform.payment.domain.repository.PaymentRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.subscription.application.port.out.PaymentGatewayPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RetryPaymentUseCase {

    private final PaymentRepository paymentRepository;
    private final Map<String, PaymentGatewayPort> gatewayAdapters;
    private final CompanyRepository companyRepository;
    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    // PENDING quá 15 phút = hết hạn với VNPay
    private static final int PENDING_EXPIRY_MINUTES = 15;

    @Transactional
    public Result execute(UUID paymentId, UUID requesterId, boolean isAdmin) {
        Payment old = paymentRepository.findById(paymentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Payment", paymentId));

        // Kiểm tra quyền: không phải admin → chỉ được retry của mình
        if (!isAdmin) {
            validateOwnership(old, requesterId);
        }

        // Validate trạng thái có thể retry
        validateRetryable(old);

        // Mark payment cũ là FAILED / reason RETRIED
        old.markRetried();
        paymentRepository.save(old);

        // Tạo payment mới — kế thừa toàn bộ thông tin, chỉ đổi orderCode + id
        String newOrderCode = generateOrderCode(old);
        Payment newPayment = Payment.builder()
                .id(UUID.randomUUID())
                .companyId(old.getCompanyId())
                .candidateId(old.getCandidateId())
                .subscriptionId(old.getSubscriptionId())
                .planCode(old.getPlanCode())
                .amount(old.getAmount())
                .currency(old.getCurrency())
                .gateway(old.getGateway()) // giữ nguyên gateway cũ
                .gatewayOrderCode(newOrderCode)
                .status(PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        paymentRepository.save(newPayment);

        // Gọi gateway tạo URL
        PaymentGatewayPort gateway = resolveGateway(old.getGateway());
        String returnUrl = buildReturnUrl(old.getGateway(), old.isCompanyPayment());
        String description = "Thanh toan lai " + old.getPlanCode()
                + " - " + newOrderCode;
        String paymentUrl = gateway.createPaymentUrl(
                newOrderCode, old.getAmount(), description, returnUrl);

        log.info("[RetryPayment] oldId={} newId={} order={} gateway={}",
                paymentId, newPayment.getId(), newOrderCode, old.getGateway());

        return new Result(newPayment.getId(), newOrderCode, paymentUrl);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void validateOwnership(Payment payment, UUID requesterId) {
        if (payment.isCompanyPayment()) {
            // requesterId là userId → cần resolve sang companyId trước khi so sánh
            UUID companyId = companyRepository.findByOwnerId(requesterId)
                    .map(c -> c.getId())
                    .orElseThrow(() -> new BusinessRuleException(
                            "Bạn chưa có hồ sơ công ty.", "COMPANY_NOT_FOUND"));
            if (!companyId.equals(payment.getCompanyId())) {
                throw new BusinessRuleException(
                        "Bạn không có quyền retry giao dịch này.", "FORBIDDEN");
            }
        } else {
            // Candidate: requesterId là userId, so sánh trực tiếp với candidateId
            if (!requesterId.equals(payment.getCandidateId())) {
                throw new BusinessRuleException(
                        "Bạn không có quyền retry giao dịch này.", "FORBIDDEN");
            }
        }
    }

    private void validateRetryable(Payment payment) {
        boolean isFailed = payment.getStatus() == PaymentStatus.FAILED;
        boolean isPendingExpired = payment.getStatus() == PaymentStatus.PENDING
                && payment.getCreatedAt()
                        .isBefore(LocalDateTime.now().minusMinutes(PENDING_EXPIRY_MINUTES));

        if (!isFailed && !isPendingExpired) {
            throw new BusinessRuleException(
                    "Chỉ có thể thanh toán lại giao dịch thất bại "
                            + "hoặc đang chờ quá " + PENDING_EXPIRY_MINUTES + " phút.",
                    "PAYMENT_NOT_RETRYABLE");
        }
    }

    private PaymentGatewayPort resolveGateway(String gatewayName) {
        return switch (gatewayName.toUpperCase()) {
            case "MOMO" -> getAdapter("momoGatewayAdapter");
            case "ZALOPAY" -> getAdapter("zaloPayGatewayAdapter");
            default -> getAdapter("vnpayGatewayAdapter");
        };
    }

    private PaymentGatewayPort getAdapter(String beanName) {
        PaymentGatewayPort adapter = gatewayAdapters.get(beanName);
        if (adapter == null) {
            throw new BusinessRuleException(
                    "Cổng thanh toán không khả dụng: " + beanName, "GATEWAY_NOT_ENABLED");
        }
        return adapter;
    }

    private String buildReturnUrl(String gatewayName, boolean isCompany) {
        String prefix = isCompany
                ? "/api/v1/payments/callback/"
                : "/api/v1/payments/callback/";
        return switch (gatewayName.toUpperCase()) {
            case "MOMO" -> baseUrl + prefix + "momo/return";
            case "ZALOPAY" -> baseUrl + prefix + "zalopay/return";
            default -> baseUrl + prefix + "vnpay/return";
        };
    }

    private String generateOrderCode(Payment old) {
        String prefix = old.isCompanyPayment() ? "JP-" : "CP-";
        return prefix + UUID.randomUUID().toString()
                .replace("-", "").substring(0, 8).toUpperCase();
    }

    public record Result(UUID paymentId, String orderCode, String paymentUrl) {
    }
}