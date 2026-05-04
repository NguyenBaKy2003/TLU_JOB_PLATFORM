package edu.tlu.jobplatform.payment.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
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
    private final UUID companyId;
    private final UUID subscriptionId;
    private final String planCode;

    private final BigDecimal amount;
    private final String currency;
    private final String amountFormatted; // "5.990.000 VND"

    private final String gateway; // "VNPAY", "MOMO"
    private final String gatewayOrderCode; // mã gửi lên cổng
    private final String gatewayTransactionId;// mã GD từ cổng (sau khi success)

    private final PaymentStatus status;
    private final String statusLabel;
    private final String statusColor; // Tailwind class cho FE
    private final String failureReason;

    private final LocalDateTime createdAt; // lúc khởi tạo payment
    private final LocalDateTime completedAt; // lúc SUCCESS / FAILED

    public static PaymentResponse from(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .companyId(p.getCompanyId())
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

    // ── Helpers ───

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
