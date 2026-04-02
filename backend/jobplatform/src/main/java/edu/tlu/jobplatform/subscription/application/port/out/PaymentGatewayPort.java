package edu.tlu.jobplatform.subscription.application.port.out;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Output Port: Trừu tượng hoá cổng thanh toán.
 *
 * Mỗi gateway (VNPAY, MOMO) implement interface này.
 * UseCase chỉ phụ thuộc vào interface — không biết gateway cụ thể.
 *
 * Spring sẽ inject implementation phù hợp qua @Qualifier hoặc @Primary.
 */
public interface PaymentGatewayPort {

    /**
     * Tên gateway — dùng để lưu vào Payment record và routing callback.
     * Ví dụ: "VNPAY", "MOMO"
     */
    String getGatewayName();

    /**
     * Tạo URL redirect đến trang thanh toán của gateway.
     *
     * @param orderCode   Mã đơn hàng nội bộ (JP-A1B2C3D4)
     * @param amount      Số tiền VND
     * @param description Mô tả đơn hàng
     * @param returnUrl   URL gateway redirect về sau khi thanh toán
     * @return URL thanh toán đầy đủ (có signature)
     */
    String createPaymentUrl(String orderCode, BigDecimal amount,
            String description, String returnUrl);

    /**
     * Xác minh chữ ký HMAC từ callback params.
     * Bảo vệ khỏi giả mạo — gọi đầu tiên trong callback handler.
     *
     * @param callbackParams Tất cả params từ gateway (query string hoặc JSON body)
     * @return true nếu chữ ký hợp lệ
     */
    boolean verifyCallback(Map<String, String> callbackParams);

    /**
     * Kiểm tra callback có phải thanh toán thành công không.
     *
     * @param callbackParams Params đã được verify
     * @return true nếu thanh toán thành công
     */
    boolean isSuccess(Map<String, String> callbackParams);

    /**
     * Lấy mã giao dịch từ gateway (để lưu vào Payment record).
     *
     * @param callbackParams Params đã được verify và isSuccess = true
     * @return Transaction ID từ gateway (vnp_TransactionNo, transId...)
     */
    String extractTransactionId(Map<String, String> callbackParams);
}