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

    @Override
    public String createPaymentUrl(String orderCode, BigDecimal amount,
            String description, String returnUrl) {

        long vnpAmount = amount.multiply(BigDecimal.valueOf(100)).longValue();

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat fmt = new SimpleDateFormat("yyyyMMddHHmmss");
        String createDate = fmt.format(cld.getTime());
        cld.add(Calendar.MINUTE, 15);
        String expireDate = fmt.format(cld.getTime());

        // Tất cả value để RAW — buildHashData sẽ encode đúng 1 lần
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", config.getVersion());
        params.put("vnp_Command", config.getCommand());
        params.put("vnp_TmnCode", config.getTmnCode());
        params.put("vnp_Amount", String.valueOf(vnpAmount));
        params.put("vnp_CurrCode", config.getCurrCode());
        params.put("vnp_TxnRef", orderCode);
        params.put("vnp_OrderInfo", removeAccents(description));
        params.put("vnp_OrderType", config.getOrderType());
        params.put("vnp_Locale", config.getLocale());
        params.put("vnp_ReturnUrl", returnUrl); // raw URL, không pre-encode
        params.put("vnp_IpAddr", "127.0.0.1");
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        List<String> keys = sortedKeys(params);

        String hashData = buildHashData(params, keys);
        String secureHash = hmacSHA512(config.getHashSecret(), hashData);
        String queryUrl = buildQueryUrl(params, keys);

        log.debug("[VNPAY-CREATE] hashData   : {}", hashData);
        log.debug("[VNPAY-CREATE] secureHash : {}", secureHash);

        return config.getPaymentUrl() + "?" + queryUrl + "&vnp_SecureHash=" + secureHash;
    }

    @Override
    public boolean verifyCallback(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isBlank()) {
            log.warn("[VNPAY-VERIFY] Missing vnp_SecureHash");
            return false;
        }

        // Loại hash fields, giữ nguyên các value (Spring đã decode sẵn)
        Map<String, String> filtered = new HashMap<>(params);
        filtered.remove("vnp_SecureHash");
        filtered.remove("vnp_SecureHashType");

        List<String> keys = sortedKeys(filtered);
        String hashData = buildHashData(filtered, keys);
        String expectedHash = hmacSHA512(config.getHashSecret(), hashData);
        boolean valid = expectedHash.equalsIgnoreCase(receivedHash);

        log.debug("[VNPAY-VERIFY] hashData  : {}", hashData);
        log.debug("[VNPAY-VERIFY] expected  : {}", expectedHash);
        log.debug("[VNPAY-VERIFY] received  : {}", receivedHash);
        log.info("[VNPAY-VERIFY] result    : {}", valid);

        return valid;
    }

    @Override
    public boolean isSuccess(Map<String, String> params) {
        return "00".equals(params.get("vnp_ResponseCode"))
                && "00".equals(params.get("vnp_TransactionStatus"));
    }

    @Override
    public String extractTransactionId(Map<String, String> params) {
        return params.getOrDefault("vnp_TransactionNo", "UNKNOWN");
    }

    // ─── private helpers ────────────────────────────────────────────────────

    /** Sort key A-Z — bắt buộc theo spec VNPay */
    private List<String> sortedKeys(Map<String, String> params) {
        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);
        return keys;
    }

    /**
     * Build chuỗi để ký HMAC.
     * Rule VNPay: key=urlEncode(value), nối nhau bằng &
     * urlEncode dùng UTF-8, space thành +
     */
    private String buildHashData(Map<String, String> params, List<String> sortedKeys) {
        StringBuilder sb = new StringBuilder();
        for (String key : sortedKeys) {
            String value = params.get(key);
            if (value == null || value.isBlank())
                continue;
            if (sb.length() > 0)
                sb.append('&');
            sb.append(key).append('=').append(urlEncode(value));
        }
        return sb.toString();
    }

    /**
     * Build query string cho URL thanh toán.
     * Cả key và value đều được encode, space thành %20.
     */
    private String buildQueryUrl(Map<String, String> params, List<String> sortedKeys) {
        StringBuilder sb = new StringBuilder();
        for (String key : sortedKeys) {
            String value = params.get(key);
            if (value == null || value.isBlank())
                continue;
            if (sb.length() > 0)
                sb.append('&');
            sb.append(urlEncode(key)).append('=').append(urlEncode(value));
        }
        return sb.toString();
    }

    /**
     * URLEncoder.encode UTF-8 — space thành +, khớp với cách VNPay ký.
     */
    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    /**
     * HMAC-SHA512 — key.getBytes() không chỉ định charset,
     * khớp với VNPayUtil chính thức của VNPay.
     */
    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(), "HmacSHA512"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash)
                hex.append(String.format("%02x", b & 0xff));
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tính HMAC-SHA512", e);
        }
    }

    /** Bỏ dấu tiếng Việt để tránh encode phức tạp trong OrderInfo */
    private String removeAccents(String input) {
        if (input == null)
            return "";
        String normalized = java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD);
        return normalized.replaceAll("[^\\p{ASCII}]", "");
    }
}