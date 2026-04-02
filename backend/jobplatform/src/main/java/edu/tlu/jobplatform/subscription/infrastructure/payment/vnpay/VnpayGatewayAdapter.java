package edu.tlu.jobplatform.subscription.infrastructure.payment.vnpay;

import edu.tlu.jobplatform.subscription.application.port.out.PaymentGatewayPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * VNPAY Payment Gateway Adapter.
 *
 * Implement PaymentGatewayPort theo đặc tả VNPAY Payment v2.1.0.
 * Docs: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.md
 *
 * Kích hoạt khi:
 * payment.vnpay.enabled=true (mặc định)
 *
 * application.yml:
 * payment:
 * vnpay:
 * enabled: true
 * tmn-code: YOUR_TMN_CODE
 * hash-secret: YOUR_HASH_SECRET
 * payment-url: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
 */
@Slf4j
@Primary
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "payment.vnpay.enabled", havingValue = "true", matchIfMissing = true)
public class VnpayGatewayAdapter implements PaymentGatewayPort {

    private final VnpayConfig config;

    @Override
    public String getGatewayName() {
        return "VNPAY";
    }

    // ─────────────────────────────────────────────────────────────
    // createPaymentUrl
    // ─────────────────────────────────────────────────────────────

    @Override
    public String createPaymentUrl(String orderCode, BigDecimal amount,
            String description, String returnUrl) {
        // VNPAY tính tiền theo đơn vị * 100 (không có dấu phẩy)
        long vnpAmount = amount.multiply(BigDecimal.valueOf(100)).longValue();

        String createDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        String ipAddr = "127.0.0.1"; // Production: lấy IP thực từ request

        Map<String, String> params = new TreeMap<>(); // TreeMap để sort key tự động
        params.put("vnp_Version", config.getVersion());
        params.put("vnp_Command", config.getCommand());
        params.put("vnp_TmnCode", config.getTmnCode());
        params.put("vnp_Amount", String.valueOf(vnpAmount));
        params.put("vnp_CurrCode", config.getCurrCode());
        params.put("vnp_TxnRef", orderCode);
        params.put("vnp_OrderInfo", description);
        params.put("vnp_OrderType", config.getOrderType());
        params.put("vnp_Locale", config.getLocale());
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", ipAddr);
        params.put("vnp_CreateDate", createDate);

        String queryString = buildQueryString(params);
        String signature = hmacSHA512(config.getHashSecret(), queryString);

        return config.getPaymentUrl() + "?" + queryString + "&vnp_SecureHash=" + signature;
    }

    // ─────────────────────────────────────────────────────────────
    // verifyCallback
    // ─────────────────────────────────────────────────────────────

    @Override
    public boolean verifyCallback(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isBlank()) {
            log.warn("VNPAY callback missing vnp_SecureHash");
            return false;
        }

        // Loại bỏ các field hash trước khi tính lại
        Map<String, String> filtered = new TreeMap<>(params);
        filtered.remove("vnp_SecureHash");
        filtered.remove("vnp_SecureHashType");

        String queryString = buildQueryString(filtered);
        String expectedHash = hmacSHA512(config.getHashSecret(), queryString);

        boolean valid = expectedHash.equalsIgnoreCase(receivedHash);
        if (!valid) {
            log.warn("VNPAY signature mismatch. Expected: {} | Received: {}", expectedHash, receivedHash);
        }
        return valid;
    }

    // ─────────────────────────────────────────────────────────────
    // isSuccess
    // ─────────────────────────────────────────────────────────────

    @Override
    public boolean isSuccess(Map<String, String> params) {
        // "00" = giao dịch thành công theo VNPAY docs
        return "00".equals(params.get("vnp_ResponseCode"))
                && "00".equals(params.get("vnp_TransactionStatus"));
    }

    // ─────────────────────────────────────────────────────────────
    // extractTransactionId
    // ─────────────────────────────────────────────────────────────

    @Override
    public String extractTransactionId(Map<String, String> params) {
        return params.getOrDefault("vnp_TransactionNo", "UNKNOWN");
    }

    // ─────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────

    /**
     * Build query string từ map (đã sorted).
     * Encode value theo UTF-8, không encode key.
     */
    private String buildQueryString(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (sb.length() > 0)
                sb.append('&');
            sb.append(entry.getKey())
                    .append('=')
                    .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
        }
        return sb.toString();
    }

    /**
     * Tính HMAC-SHA512 theo key và data.
     * VNPAY dùng HMAC_SHA512 cho signature.
     */
    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(
                    key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi tính HMAC-SHA512", e);
        }
    }
}