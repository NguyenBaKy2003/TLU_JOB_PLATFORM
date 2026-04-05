package edu.tlu.jobplatform.subscription.application.port.out;

import java.math.BigDecimal;
import java.util.Map;

public interface PaymentGatewayPort {

    String getGatewayName();

    String createPaymentUrl(String orderCode, BigDecimal amount,
            String description, String returnUrl);

    /** Xác minh HMAC-SHA512 từ callback params */
    boolean verifyCallback(Map<String, String> params);

    /** Kiểm tra giao dịch có thành công không (gọi SAU verifyCallback) */
    boolean isSuccess(Map<String, String> params);

    /** Lấy transaction ID từ gateway (vnp_TransactionNo / transId) */
    String extractTransactionId(Map<String, String> params);
}
