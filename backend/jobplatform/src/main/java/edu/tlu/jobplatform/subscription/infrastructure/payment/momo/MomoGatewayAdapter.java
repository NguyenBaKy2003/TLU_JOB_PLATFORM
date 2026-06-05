package edu.tlu.jobplatform.subscription.infrastructure.payment.momo;

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
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "payment.momo.enabled", havingValue = "true")
public class MomoGatewayAdapter implements PaymentGatewayPort {

    private final MomoConfig config;
    private final ObjectMapper objectMapper;

    @Override
    public String getGatewayName() {
        return "MOMO";
    }

    @Override
    public String createPaymentUrl(String orderCode, BigDecimal amount,
            String description, String returnUrl) {
        try {
            String requestId = UUID.randomUUID().toString();
            long amountLong = amount.longValue();
            String requestType = "payWithATM"; // ← thẻ nội địa ATM

            // Thứ tự field trong rawSignature phải khớp đúng với docs MoMo
            String rawSignature = "accessKey=" + config.getAccessKey()
                    + "&amount=" + amountLong
                    + "&extraData="
                    + "&ipnUrl=" + config.getIpnUrl()
                    + "&orderId=" + orderCode
                    + "&orderInfo=" + description
                    + "&partnerCode=" + config.getPartnerCode()
                    + "&redirectUrl=" + returnUrl
                    + "&requestId=" + requestId
                    + "&requestType=" + requestType;

            String signature = hmacSHA256(config.getSecretKey(), rawSignature);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("partnerCode", config.getPartnerCode());
            body.put("partnerName", "TLU CareerUp");
            body.put("storeId", "CareerUpStore");
            body.put("requestId", requestId);
            body.put("amount", amountLong);
            body.put("orderId", orderCode);
            body.put("orderInfo", description);
            body.put("redirectUrl", returnUrl);
            body.put("ipnUrl", config.getIpnUrl());
            body.put("requestType", requestType);
            body.put("extraData", "");
            body.put("lang", "vi");
            body.put("signature", signature);

            String jsonBody = objectMapper.writeValueAsString(body);
            log.debug("[MOMO-CREATE] rawSignature: {}", rawSignature);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(config.getEndpoint()))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = client.send(request,
                    HttpResponse.BodyHandlers.ofString());

            Map<?, ?> result = objectMapper.readValue(response.body(), Map.class);

            // payWithATM trả về "payUrl" (cùng key với captureWallet)
            String payUrl = (String) result.get("payUrl");

            if (payUrl == null || payUrl.isBlank())
                throw new RuntimeException("MoMo không trả về payUrl: " + response.body());

            log.info("[MOMO-CREATE] order={} payUrl={}", orderCode, payUrl);
            return payUrl;

        } catch (Exception e) {
            throw new RuntimeException("Tạo MoMo payment URL thất bại: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean verifyCallback(Map<String, String> params) {
        String received = params.get("signature");
        if (received == null || received.isBlank()) {
            log.warn("[MOMO-VERIFY] Missing signature");
            return false;
        }

        // Thứ tự field IPN callback — theo MoMo docs (alphabetical trên key)
        String rawSignature = "accessKey=" + config.getAccessKey()
                + "&amount=" + params.get("amount")
                + "&extraData=" + params.getOrDefault("extraData", "")
                + "&message=" + params.getOrDefault("message", "")
                + "&orderId=" + params.get("orderId")
                + "&orderInfo=" + params.getOrDefault("orderInfo", "")
                + "&orderType=" + params.getOrDefault("orderType", "")
                + "&partnerCode=" + params.get("partnerCode")
                + "&payType=" + params.getOrDefault("payType", "")
                + "&requestId=" + params.get("requestId")
                + "&responseTime=" + params.getOrDefault("responseTime", "")
                + "&resultCode=" + params.get("resultCode")
                + "&transId=" + params.get("transId");

        String expected = hmacSHA256(config.getSecretKey(), rawSignature);
        boolean valid = expected.equals(received);
        log.info("[MOMO-VERIFY] result={}", valid);
        return valid;
    }

    @Override
    public boolean isSuccess(Map<String, String> params) {
        return "0".equals(params.get("resultCode"));
    }

    @Override
    public String extractTransactionId(Map<String, String> params) {
        return params.getOrDefault("transId", "UNKNOWN");
    }

    private String hmacSHA256(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] result = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : result)
                sb.append(String.format("%02x", b & 0xff));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("HMAC-SHA256 error", e);
        }
    }
}