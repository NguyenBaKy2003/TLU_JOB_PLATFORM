package edu.tlu.jobplatform.subscription.infrastructure.payment.zalopay;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.subscription.application.port.out.PaymentGatewayPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "payment.zalopay.enabled", havingValue = "true")
public class ZaloPayGatewayAdapter implements PaymentGatewayPort {

    private static final String HMAC_ALGO = "HmacSHA256";
    private static final String APP_USER = "demo";
    private static final String ITEM = "[]";

    private final ZaloPayConfig config;
    private final ObjectMapper objectMapper;

    @Override
    public String getGatewayName() {
        return "ZALOPAY";
    }

    @Override
    public String createPaymentUrl(String orderCode, BigDecimal amount,
            String description, String returnUrl) {
        try {
            long appTime = System.currentTimeMillis();
            long amountLong = amount.longValue();

            // Nhúng orderCode vào appTransId để callback extract ra phân biệt CP-/JP-
            // Format: yyMMdd_orderCode_appTime (ZaloPay max 40 ký tự)
            String appTransId = buildAppTransId(orderCode, appTime);
            String embedData = buildEmbedData();

            // MAC: app_id|app_trans_id|app_user|amount|app_time|embed_data|item
            String rawMac = String.join("|",
                    config.getAppId(),
                    appTransId,
                    APP_USER,
                    String.valueOf(amountLong),
                    String.valueOf(appTime),
                    embedData,
                    ITEM);

            String mac = hmacSHA256(config.getKey1(), rawMac);

            log.debug("[ZALOPAY] orderCode={} appTransId={}", orderCode, appTransId);
            log.debug("[ZALOPAY] embedData={}", embedData);
            log.debug("[ZALOPAY] rawMac={}", rawMac);
            log.debug("[ZALOPAY] mac={}", mac);

            Map<String, String> params = new LinkedHashMap<>();
            params.put("app_id", config.getAppId());
            params.put("app_trans_id", appTransId);
            params.put("app_user", APP_USER);
            params.put("app_time", String.valueOf(appTime));
            params.put("amount", String.valueOf(amountLong));
            params.put("item", ITEM);
            params.put("embed_data", embedData);
            params.put("description", sanitizeDescription(description));
            params.put("bank_code", "");
            params.put("callback_url", config.getIpnUrl());
            params.put("mac", mac);

            String responseBody = httpPostForm(config.getEndpoint(), params);
            log.debug("[ZALOPAY] response={}", responseBody);

            return parseOrderUrl(responseBody);

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Tạo ZaloPay URL thất bại: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean verifyCallback(Map<String, String> params) {
        String data = params.get("data");
        String received = params.get("mac");

        if (isBlank(data)) {
            log.warn("[ZALOPAY] thiếu 'data'");
            return false;
        }
        if (isBlank(received)) {
            log.warn("[ZALOPAY] thiếu 'mac'");
            return false;
        }

        String expected = hmacSHA256(config.getKey2(), data);
        boolean valid = expected.equalsIgnoreCase(received);

        if (valid)
            log.info("[ZALOPAY] MAC hợp lệ");
        else
            log.warn("[ZALOPAY] MAC không khớp expected={} received={}", expected, received);

        return valid;
    }

    @Override
    public boolean isSuccess(Map<String, String> params) {
        try {
            String data = params.get("data");
            if (isBlank(data))
                return false;
            Map<?, ?> parsed = objectMapper.readValue(data, Map.class);
            int returnCode = toInt(parsed.get("return_code"));
            log.info("[ZALOPAY] isSuccess – return_code={}", returnCode);
            return returnCode == 1;
        } catch (Exception e) {
            log.error("[ZALOPAY] isSuccess parse lỗi: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public String extractTransactionId(Map<String, String> params) {
        try {
            String data = params.get("data");
            if (isBlank(data))
                return "UNKNOWN";
            Map<?, ?> parsed = objectMapper.readValue(data, Map.class);
            Object zpTransId = parsed.get("zp_trans_id");
            return zpTransId != null ? zpTransId.toString() : "UNKNOWN";
        } catch (Exception e) {
            log.error("[ZALOPAY] extractTransactionId lỗi: {}", e.getMessage());
            return "UNKNOWN";
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Nhúng orderCode vào appTransId để AbstractPaymentCallbackUseCase
     * extract ra và tìm đúng Payment trong DB.
     * Format: yyMMdd_orderCode_appTime
     * ZaloPay giới hạn 40 ký tự — truncate nếu cần.
     */
    private String buildAppTransId(String orderCode, long appTime) {
        String date = new SimpleDateFormat("yyMMdd").format(new Date());
        String raw = date + "_" + orderCode + "_" + appTime;
        return raw.length() > 40 ? raw.substring(0, 40) : raw;
    }

    /**
     * embed_data build một lần, dùng chung cho MAC và body — tránh mismatch.
     * redirecturl: ZaloPay redirect về backend sau thanh toán.
     */
    private String buildEmbedData() {
        return "{\"redirecturl\":\"" + config.getRedirectUrl() + "\"}";
    }

    private String parseOrderUrl(String responseBody) throws Exception {
        Map<?, ?> result = objectMapper.readValue(responseBody, Map.class);
        int returnCode = toInt(result.get("return_code"));

        if (returnCode != 1) {
            log.error("[ZALOPAY] FAILED return_code={} sub_return_code={} msg={}",
                    returnCode, result.get("sub_return_code"), result.get("sub_return_message"));
            throw new RuntimeException("ZaloPay lỗi [" + returnCode + "]: "
                    + result.get("return_message")
                    + " / sub=" + result.get("sub_return_message"));
        }

        String orderUrl = (String) result.get("order_url");
        if (isBlank(orderUrl))
            throw new RuntimeException("ZaloPay không trả về order_url: " + responseBody);

        return orderUrl;
    }

    private String sanitizeDescription(String input) {
        if (input == null)
            return "";
        return java.text.Normalizer
                .normalize(input, java.text.Normalizer.Form.NFD)
                .replaceAll("[^\\p{ASCII}]", "")
                .trim();
    }

    private String httpPostForm(String url, Map<String, String> params) throws Exception {
        String formBody = params.entrySet().stream()
                .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8)
                        + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(formBody, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response = client.send(request,
                HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

        if (response.statusCode() != 200)
            throw new RuntimeException("HTTP " + response.statusCode() + ": " + response.body());

        return response.body();
    }

    private String hmacSHA256(String key, String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGO);
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), HMAC_ALGO));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash)
                sb.append(String.format("%02x", b & 0xff));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("HMAC-SHA256 lỗi", e);
        }
    }

    private int toInt(Object value) {
        return switch (value) {
            case Integer i -> i;
            case Number n -> n.intValue();
            case String s -> Integer.parseInt(s.trim());
            case null, default -> -1;
        };
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}