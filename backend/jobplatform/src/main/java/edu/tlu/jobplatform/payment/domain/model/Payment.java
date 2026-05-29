package edu.tlu.jobplatform.payment.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class Payment {

    private final UUID id;

    private final UUID companyId;

    private final UUID candidateId;

    private final UUID subscriptionId;
    private final String planCode;
    private final BigDecimal amount;
    private final String currency;
    private final String gateway;
    private final String gatewayOrderCode;

    private PaymentStatus status;
    private String gatewayTransactionId;
    private String failureReason;
    private LocalDateTime completedAt;

    private final LocalDateTime createdAt;

    // ── Domain behaviours ──────────────────────────────────────────────

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

    public boolean isCompanyPayment() {
        return companyId != null;
    }

    public boolean isCandidatePayment() {
        return candidateId != null;
    }
}