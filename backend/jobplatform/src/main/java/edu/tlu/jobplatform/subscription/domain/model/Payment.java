package edu.tlu.jobplatform.subscription.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Lưu lịch sử giao dịch thanh toán.
 *
 * Payment record được tạo khi user bắt đầu thanh toán (PENDING),
 * sau đó gateway callback về để cập nhật status.
 */
@Getter
@Builder
public class Payment {

    private final UUID id;
    private final UUID companyId;
    private final UUID subscriptionId;
    private final String planCode;
    private final BigDecimal amount;
    private final String currency;
    private final String gateway; // "VNPAY", "MOMO"
    private final String gatewayOrderCode; // mã gửi lên gateway

    // Mutable — cập nhật khi gateway callback
    private PaymentStatus status;
    private String gatewayTransactionId;
    private String failureReason;
    private LocalDateTime completedAt;

    private final LocalDateTime createdAt;

    // ── State transitions ─────────────────────────────────────

    public void markSuccess(String transactionId) {
        this.status = PaymentStatus.SUCCESS;
        this.gatewayTransactionId = transactionId;
        this.completedAt = LocalDateTime.now();
    }

    public void markFailed(String reason) {
        this.status = PaymentStatus.FAILED;
        this.failureReason = reason;
        this.completedAt = LocalDateTime.now();
    }

    public boolean isSuccess() {
        return status == PaymentStatus.SUCCESS;
    }
}