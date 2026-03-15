package edu.tlu.jobplatform.shared.event.subscription;

import edu.tlu.jobplatform.shared.event.DomainEvent;
import lombok.Getter;

import java.util.UUID;

/**
 * Thanh toán thành công — xác nhận từ webhook VNPay/MoMo.
 *
 * Consumers:
 *   - Subscription domain → kích hoạt gói dịch vụ
 *   - Notification domain → gửi hóa đơn thanh toán
 */
@Getter
public class PaymentSuccessEvent extends DomainEvent {

    private final UUID   paymentId;
    private final UUID   companyId;
    private final String planCode;
    private final Long   amountVnd;

    /** VNPAY | MOMO | STRIPE */
    private final String gateway;

    public PaymentSuccessEvent(UUID paymentId, UUID companyId,
                               String planCode, Long amountVnd, String gateway) {
        super();
        this.paymentId = paymentId;
        this.companyId = companyId;
        this.planCode  = planCode;
        this.amountVnd = amountVnd;
        this.gateway   = gateway;
    }
}
