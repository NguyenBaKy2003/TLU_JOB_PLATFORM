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

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat fmt = new SimpleDateFormat("yyyyMMddHHmmss");
        String createDate = fmt.format(cld.getTime());
        cld.add(Calendar.MINUTE, 15);
        String expireDate = fmt.format(cld.getTime());

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
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", "127.0.0.1");
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        // Hash data: key=URLEncode(value), encodeKey=false
        String hashData = getPaymentURL(params, false);
        String secureHash = hmacSHA512(config.getHashSecret(), hashData);

        // Query URL: URLEncode(key)=URLEncode(value), encodeKey=true
        String queryUrl = getPaymentURL(params, true);

        log.debug("[VNPAY-CREATE] createDate={} expireDate={}", createDate, expireDate);
        log.debug("[VNPAY-CREATE] hashData ({} chars)   : {}", hashData.length(), hashData);
        log.debug("[VNPAY-CREATE] secureHash ({} chars) : {}", secureHash.length(), secureHash);

        return config.getPaymentUrl() + "?" + queryUrl + "&vnp_SecureHash=" + secureHash;
    }

    @Override
    public boolean verifyCallback(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null || receivedHash.isBlank()) {
            log.warn("[VNPAY-VERIFY] Missing vnp_SecureHash");
            return false;
        }

        // Lấy toàn bộ params, loại hash fields
        Map<String, String> fields = new HashMap<>(params);
        fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");

        // Hash data: key=URLEncode(value), encodeKey=false — giống hệt lúc tạo URL
        String hashData = getPaymentURL(fields, false);
        String expectedHash = hmacSHA512(config.getHashSecret(), hashData);
        boolean valid = expectedHash.equals(receivedHash);

        log.debug("[VNPAY-VERIFY] hashData ({} chars)  : {}", hashData.length(), hashData);
        log.debug("[VNPAY-VERIFY] expected ({} chars)  : {}", expectedHash.length(), expectedHash);
        log.debug("[VNPAY-VERIFY] received ({} chars)  : {}", receivedHash.length(), receivedHash);
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

    // helpers — port từ VNPayUtil của tài liệu ─

    /**
     * Build payment URL theo đúng spec VNPay.
     *
     * encodeKey=false → hash data: key=URLEncode(value) nối bằng &
     * encodeKey=true → query URL: URLEncode(key)=URLEncode(value) nối bằng &
     *
     * Value luôn được URLEncode — đây là điểm then chốt theo tài liệu VNPay.
     * Key sort A-Z trước khi build.
     */
    private String getPaymentURL(Map<String, String> params, boolean encodeKey) {
        StringBuilder sb = new StringBuilder();
        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);
        Iterator<String> itr = keys.iterator();
        while (itr.hasNext()) {
            String key = itr.next();
            String value = params.get(key);
            if (value == null || value.isEmpty())
                continue;
            try {
                if (encodeKey) {
                    sb.append(URLEncoder.encode(key, StandardCharsets.UTF_8.toString()));
                } else {
                    sb.append(key);
                }
                sb.append('=');
                sb.append(URLEncoder.encode(value, StandardCharsets.UTF_8.toString()));
                if (itr.hasNext())
                    sb.append('&');
            } catch (Exception e) {
                log.error("URLEncode error: key={}", key, e);
            }
        }
        return sb.toString();
    }

    /**
     * HMAC-SHA512 theo đúng VNPayUtil của tài liệu:
     * key.getBytes() — không chỉ định charset (platform default, thường UTF-8)
     * data.getBytes(UTF-8)
     * output: lowercase hex, luôn đủ 128 ký tự
     */
    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] keyBytes = key.getBytes(); // giữ nguyên như VNPayUtil gốc
            hmac512.init(new SecretKeySpec(keyBytes, "HmacSHA512"));
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result)
                sb.append(String.format("%02x", b & 0xff));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tính HMAC-SHA512", e);
        }
    }

    /** Bỏ dấu tiếng Việt trong OrderInfo */
    private String removeAccents(String input) {
        if (input == null)
            return "";
        String normalized = java.text.Normalizer.normalize(input,
                java.text.Normalizer.Form.NFD);
        return normalized.replaceAll("[^\\p{ASCII}]", "");
    }
}