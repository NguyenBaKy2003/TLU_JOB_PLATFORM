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
        long vnpAmount = amount.multiply(BigDecimal.valueOf(100)).longValue();

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String createDate = formatter.format(cld.getTime());

        cld.add(Calendar.MINUTE, 15);
        String expireDate = formatter.format(cld.getTime());

        Map<String, String> params = new TreeMap<>();
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
        params.put("vnp_IpAddr", "127.0.0.1");
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        // Bước 1: tính chữ ký — encode value, KHÔNG encode key
        String hashData = buildHashData(params);
        String signature = hmacSHA512(config.getHashSecret(), hashData);

        // Bước 2: build URL — encode cả key lẫn value
        String queryUrl = buildQueryString(params);
        return config.getPaymentUrl() + "?" + queryUrl + "&vnp_SecureHash=" + signature;
    }

    @Override
    public boolean verifyCallback(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isBlank()) {
            log.warn("VNPAY callback missing vnp_SecureHash");
            return false;
        }

        Map<String, String> filtered = new TreeMap<>(params);
        filtered.remove("vnp_SecureHash");
        filtered.remove("vnp_SecureHashType");

        String hashData = buildHashData(filtered);
        String expectedHash = hmacSHA512(config.getHashSecret(), hashData);

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

    /**
     * Dùng để tính chữ ký:
     * - Key KHÔNG encode
     * - Value CÓ encode (theo đúng VNPayUtil.getPaymentURL encodeKey=false)
     */
    private String buildHashData(Map<String, String> params) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String name = itr.next();
            String value = params.get(name);
            if (value != null && !value.isEmpty()) {
                sb.append(name).append('=')
                        .append(URLEncoder.encode(value, StandardCharsets.UTF_8));
                if (itr.hasNext())
                    sb.append('&');
            }
        }
        return sb.toString();
    }

    /**
     * Dùng để build URL:
     * - Key CÓ encode
     * - Value CÓ encode (theo VNPayUtil.getPaymentURL encodeKey=true)
     */
    private String buildQueryString(Map<String, String> params) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String name = itr.next();
            String value = params.get(name);
            if (value != null && !value.isEmpty()) {
                sb.append(URLEncoder.encode(name, StandardCharsets.UTF_8))
                        .append('=')
                        .append(URLEncoder.encode(value, StandardCharsets.UTF_8));
                if (itr.hasNext())
                    sb.append('&');
            }
        }
        return sb.toString();
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(
                    key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKey);
            byte[] result = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(2 * result.length);
            for (byte b : result) {
                hex.append(String.format("%02x", b & 0xff));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tính HMAC-SHA512", e);
        }
    }
}