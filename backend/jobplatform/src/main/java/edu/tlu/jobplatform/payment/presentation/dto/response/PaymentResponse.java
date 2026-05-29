package edu.tlu.jobplatform.payment.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.model.SubscriptionPlan;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentResponse {

    private final UUID id;

    /** Null nếu là giao dịch của Candidate */
    private final UUID companyId;

    /** Null nếu là giao dịch của Company */
    private final UUID candidateId;

    private final UUID subscriptionId;
    private final String planCode;

    private final BigDecimal amount;
    private final String currency;
    private final String amountFormatted;

    private final String gateway;
    private final String gatewayOrderCode;
    private final String gatewayTransactionId;

    private final PaymentStatus status;
    private final String statusLabel;
    private final String statusColor;
    private final String failureReason;

    private final LocalDateTime createdAt;
    private final LocalDateTime completedAt;

    /** Thông tin gói dịch vụ — null nếu không truyền plan vào from() */
    private final SubscriptionSummary subscription;

    // ── Factory: không có plan (danh sách, callback) ──────────────────

    public static PaymentResponse from(Payment p) {
        return toBuilder(p).build();
    }

    // ── Factory: kèm plan Company ─────────────────────────────────────

    public static PaymentResponse from(Payment p, SubscriptionPlan plan) {
        return toBuilder(p)
                .subscription(SubscriptionSummary.fromCompanyPlan(plan))
                .build();
    }

    // ── Factory: kèm plan Candidate ───────────────────────────────────

    public static PaymentResponse from(Payment p, CandidateSubscriptionPlan plan) {
        return toBuilder(p)
                .subscription(SubscriptionSummary.fromCandidatePlan(plan))
                .build();
    }

    // ── Shared builder — đổi tên tránh xung đột với Lombok builder() ──

    private static PaymentResponseBuilder toBuilder(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .companyId(p.getCompanyId())
                .candidateId(p.getCandidateId())
                .subscriptionId(p.getSubscriptionId())
                .planCode(p.getPlanCode())
                .amount(p.getAmount())
                .currency(p.getCurrency() != null ? p.getCurrency() : "VND")
                .amountFormatted(formatVND(p.getAmount()))
                .gateway(p.getGateway())
                .gatewayOrderCode(p.getGatewayOrderCode())
                .gatewayTransactionId(p.getGatewayTransactionId())
                .status(p.getStatus())
                .statusLabel(toLabel(p.getStatus()))
                .statusColor(toColor(p.getStatus()))
                .failureReason(p.getFailureReason())
                .createdAt(p.getCreatedAt())
                .completedAt(p.getCompletedAt());
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private static String formatVND(BigDecimal amount) {
        if (amount == null)
            return null;
        NumberFormat nf = NumberFormat.getInstance(new Locale("vi", "VN"));
        return nf.format(amount) + " VND";
    }

    private static String toLabel(PaymentStatus s) {
        if (s == null)
            return "";
        return switch (s) {
            case PENDING -> "Chờ thanh toán";
            case SUCCESS -> "Thành công";
            case FAILED -> "Thất bại";
            case REFUNDED -> "Đã hoàn tiền";
        };
    }

    private static String toColor(PaymentStatus s) {
        if (s == null)
            return "";
        return switch (s) {
            case PENDING -> "bg-amber-50 text-amber-700";
            case SUCCESS -> "bg-green-50 text-green-700";
            case FAILED -> "bg-red-50 text-red-700";
            case REFUNDED -> "bg-blue-50 text-blue-700";
        };
    }
}