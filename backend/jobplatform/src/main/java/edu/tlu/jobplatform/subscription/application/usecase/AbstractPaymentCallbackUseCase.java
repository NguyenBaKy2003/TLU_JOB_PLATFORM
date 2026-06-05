package edu.tlu.jobplatform.subscription.application.usecase;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.subscription.application.port.out.PaymentGatewayPort;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

@Slf4j
public abstract class AbstractPaymentCallbackUseCase {

    protected abstract List<PaymentGatewayPort> getGateways();

    /**
     * Detect gateway từ params:
     * - VNPay → "vnp_TxnRef" hoặc "vnp_SecureHash"
     * - MoMo → "partnerCode"
     * - ZaloPay → "data" + "mac"
     */
    protected PaymentGatewayPort detectGateway(Map<String, String> params) {
        String name;

        if (params.containsKey("vnp_TxnRef") || params.containsKey("vnp_SecureHash")) {
            name = "VNPAY";
        } else if (params.containsKey("partnerCode")) {
            name = "MOMO";
        } else if (params.containsKey("data") && params.containsKey("mac")) {
            name = "ZALOPAY";
        } else {
            log.error("[CALLBACK] Unknown gateway, params keys: {}", params.keySet());
            throw new BusinessRuleException(
                    "Không xác định được payment gateway.", "UNKNOWN_GATEWAY");
        }

        final String gatewayName = name;
        return getGateways().stream()
                .filter(g -> g.getGatewayName().equalsIgnoreCase(gatewayName))
                .findFirst()
                .orElseThrow(() -> new BusinessRuleException(
                        "Gateway chưa được kích hoạt: " + gatewayName, "GATEWAY_NOT_ENABLED"));
    }

    /**
     * Resolve orderCode từ params của bất kỳ gateway nào.
     *
     * VNPay → vnp_TxnRef (trực tiếp là orderCode)
     * MoMo → orderId (trực tiếp là orderCode)
     * ZaloPay IPN → parse app_trans_id từ JSON field "data"
     * appTransId format: yyMMdd_orderCode_appTime
     * → split "_" lấy phần giữa là orderCode
     * ZaloPay return → query param "apptransid" (cùng format)
     */
    protected String resolveOrderCode(Map<String, String> params) {

        // VNPay
        String code = params.get("vnp_TxnRef");
        if (!isBlank(code))
            return code;

        // MoMo
        code = params.get("orderId");
        if (!isBlank(code))
            return code;

        // ZaloPay IPN — app_trans_id nằm trong JSON "data"
        String data = params.get("data");
        if (!isBlank(data)) {
            String extracted = extractOrderCodeFromAppTransId(parseAppTransId(data));
            if (!isBlank(extracted))
                return extracted;
        }

        // ZaloPay return URL — apptransid là query param trực tiếp
        String appTransId = params.get("apptransid");
        if (!isBlank(appTransId)) {
            String extracted = extractOrderCodeFromAppTransId(appTransId);
            if (!isBlank(extracted))
                return extracted;
        }

        log.error("[CALLBACK] Không resolve được orderCode, params={}", params);
        throw new BusinessRuleException(
                "Không tìm thấy orderCode trong callback.", "MISSING_ORDER_CODE");
    }

    /**
     * Parse app_trans_id từ ZaloPay JSON data field.
     * data là JSON string: {"app_trans_id":"yyMMdd_orderCode_appTime", ...}
     */
    private String parseAppTransId(String data) {
        try {
            Map<?, ?> parsed = new ObjectMapper().readValue(data, Map.class);
            Object val = parsed.get("app_trans_id");
            return val != null ? val.toString() : null;
        } catch (Exception e) {
            log.warn("[CALLBACK] Không parse được ZaloPay data: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extract orderCode từ appTransId.
     * Format do ZaloPayGatewayAdapter tạo: yyMMdd_orderCode_appTime
     * → split("_", 3) lấy parts[1] = orderCode (CP-XXXXXXXX hoặc JP-XXXXXXXX)
     */
    private String extractOrderCodeFromAppTransId(String appTransId) {
        if (isBlank(appTransId))
            return null;
        // split tối đa 3 phần: [yyMMdd, orderCode, appTime]
        String[] parts = appTransId.split("_", 3);
        if (parts.length >= 2) {
            log.debug("[CALLBACK] Extracted orderCode={} from appTransId={}", parts[1], appTransId);
            return parts[1];
        }
        log.warn("[CALLBACK] appTransId format không đúng: {}", appTransId);
        return null;
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}