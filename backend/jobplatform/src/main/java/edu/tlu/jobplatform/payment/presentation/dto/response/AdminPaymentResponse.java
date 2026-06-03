package edu.tlu.jobplatform.payment.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import edu.tlu.jobplatform.payment.domain.model.Payment;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;

import java.text.NumberFormat;
import java.util.Locale;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminPaymentResponse {

    private final UUID id;

    private final UUID companyId;
    private final String companyName; // enriched

    private final UUID candidateId;
    private final String candidateName; // enriched (fullName + email)

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

    // ── Factory ───────────────────────────────────────────────────────────────

    public static AdminPaymentResponse from(Payment p, String companyName, String candidateName) {
        return AdminPaymentResponse.builder()
                .id(p.getId())
                .companyId(p.getCompanyId())
                .companyName(companyName)
                .candidateId(p.getCandidateId())
                .candidateName(candidateName)
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
                .completedAt(p.getCompletedAt())
                .build();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

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