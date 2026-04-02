package edu.tlu.jobplatform.subscription.infrastructure.persistence.entity;

import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import edu.tlu.jobplatform.subscription.domain.model.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments", indexes = {
        @Index(name = "idx_payment_company", columnList = "company_id"),
        @Index(name = "idx_payment_order_code", columnList = "gateway_order_code", unique = true),
        @Index(name = "idx_payment_status", columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentJpaEntity extends BaseJpaEntity {

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "subscription_id")
    private UUID subscriptionId;

    @Column(name = "plan_code", length = 30)
    private String planCode;

    @Column(nullable = false, precision = 15, scale = 0)
    private BigDecimal amount;

    @Column(length = 10)
    private String currency;

    @Column(length = 20)
    private String gateway;

    @Column(name = "gateway_order_code", length = 100, unique = true)
    private String gatewayOrderCode;

    @Column(name = "gateway_transaction_id", length = 200)
    private String gatewayTransactionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}