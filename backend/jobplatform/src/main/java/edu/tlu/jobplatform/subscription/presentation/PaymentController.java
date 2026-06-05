package edu.tlu.jobplatform.subscription.presentation;

import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.subscription.application.usecase.HandleCandidatePaymentCallbackUseCase;
import edu.tlu.jobplatform.subscription.application.usecase.HandlePaymentCallbackUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments/callback")
@RequiredArgsConstructor
@Tag(name = "Payment Callback", description = "Webhook từ cổng thanh toán")
public class PaymentController {

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    private final HandlePaymentCallbackUseCase callbackUseCase;
    private final HandleCandidatePaymentCallbackUseCase candidateCallbackUseCase;

    // ── VNPay ─────────────────────────────────────────────────────────────────

    @Operation(summary = "VNPay Return URL")
    @GetMapping("/vnpay/return")
    @Loggable(action = "PAYMENT_VNPAY_RETURN", resourceType = "Payment")
    public void vnpayReturn(@RequestParam Map<String, String> params,
            HttpServletResponse response) throws IOException {
        String txnRef = params.get("vnp_TxnRef");
        boolean isCandidate = txnRef != null && txnRef.startsWith("CP-");
        String successPath = isCandidate ? "/candidate/payment-success" : "/employer/payment-success";
        String failurePath = isCandidate ? "/candidate/payment-failure" : "/employer/payment-failure";

        log.info("[VNPAY-RETURN] txnRef={}", txnRef);

        if (!"00".equals(params.getOrDefault("vnp_ResponseCode", "99"))) {
            response.sendRedirect(frontendUrl + failurePath
                    + "?reason=" + params.get("vnp_ResponseCode") + "&gateway=VNPAY");
            return;
        }
        try {
            if (isCandidate)
                candidateCallbackUseCase.execute(params);
            else
                callbackUseCase.execute(params);
            response.sendRedirect(frontendUrl + successPath);
        } catch (Exception e) {
            log.error("[VNPAY-RETURN] error: {}", e.getMessage(), e);
            response.sendRedirect(frontendUrl + failurePath + "?reason=99&gateway=VNPAY");
        }
    }

    @Operation(summary = "VNPay IPN")
    @PostMapping("/vnpay/ipn")
    @Loggable(action = "PAYMENT_VNPAY_IPN", resourceType = "Payment")
    public ResponseEntity<String> vnpayIpn(@RequestParam Map<String, String> params) {
        String txnRef = params.get("vnp_TxnRef");
        boolean isCandidate = txnRef != null && txnRef.startsWith("CP-");
        log.info("[VNPAY-IPN] txnRef={}", txnRef);
        try {
            if (isCandidate)
                candidateCallbackUseCase.execute(params);
            else
                callbackUseCase.execute(params);
            return ResponseEntity.ok("RspCode=00&Message=Confirm Success");
        } catch (BusinessRuleException e) {
            String rspCode = "INVALID_CALLBACK_SIGNATURE".equals(e.getErrorCode()) ? "97" : "02";
            return ResponseEntity.ok("RspCode=" + rspCode + "&Message=" + e.getMessage());
        } catch (Exception e) {
            log.error("[VNPAY-IPN] error: {}", e.getMessage(), e);
            return ResponseEntity.ok("RspCode=99&Message=System Error");
        }
    }

    // ── MoMo ─────────────────────────────────────────────────────────────────

    @Operation(summary = "MoMo IPN")
    @PostMapping("/momo/ipn")
    public ResponseEntity<String> momoIpn(@RequestBody Map<String, String> params) {
        String orderId = params.get("orderId");
        boolean isCandidate = orderId != null && orderId.startsWith("CP-");
        try {
            if (isCandidate)
                candidateCallbackUseCase.execute(params);
            else
                callbackUseCase.execute(params);
            return ResponseEntity.ok("{\"resultCode\":0}");
        } catch (Exception e) {
            log.error("[MOMO-IPN] error: {}", e.getMessage(), e);
            return ResponseEntity.ok("{\"resultCode\":99}");
        }
    }

    @Operation(summary = "MoMo Return URL")
    @GetMapping("/momo/return")
    public void momoReturn(@RequestParam Map<String, String> params,
            HttpServletResponse response) throws IOException {
        String orderId = params.get("orderId");
        boolean isCandidate = orderId != null && orderId.startsWith("CP-");
        String successPath = isCandidate ? "/candidate/payment-success" : "/employer/payment-success";
        String failurePath = isCandidate ? "/candidate/payment-failure" : "/employer/payment-failure";

        if (!"0".equals(params.getOrDefault("resultCode", "99"))) {
            response.sendRedirect(frontendUrl + failurePath
                    + "?reason=" + params.get("resultCode") + "&gateway=MOMO");
            return;
        }
        try {
            if (isCandidate)
                candidateCallbackUseCase.execute(params);
            else
                callbackUseCase.execute(params);
            response.sendRedirect(frontendUrl + successPath);
        } catch (Exception e) {
            log.error("[MOMO-RETURN] error: {}", e.getMessage(), e);
            response.sendRedirect(frontendUrl + failurePath + "?reason=99&gateway=MOMO");
        }
    }

    // ── ZaloPay ──────────────────────────────────────────────────────────────

    @Operation(summary = "ZaloPay IPN (server-to-server)")
    @PostMapping("/zalopay/callback")
    public ResponseEntity<Map<String, Object>> zaloPayCallback(
            @RequestBody Map<String, String> params) {

        boolean isCandidate = extractIsCandidate(params.get("data"));
        log.info("[ZALOPAY-IPN] isCandidate={}", isCandidate);

        try {
            if (isCandidate)
                candidateCallbackUseCase.execute(params);
            else
                callbackUseCase.execute(params);
            return ResponseEntity.ok(Map.of("return_code", 1, "return_message", "success"));
        } catch (Exception e) {
            log.error("[ZALOPAY-IPN] error: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of("return_code", 0, "return_message", e.getMessage()));
        }
    }

    @Operation(summary = "ZaloPay Return URL")
    @GetMapping("/zalopay/return")
    public void zaloPayReturn(@RequestParam Map<String, String> params,
            HttpServletResponse response) throws IOException {

        String appTransId = params.get("apptransid");
        String orderCode = extractOrderCode(appTransId);
        boolean isCandidate = orderCode != null && orderCode.startsWith("CP-");
        String successPath = isCandidate ? "/candidate/payment-success" : "/employer/payment-success";
        String failurePath = isCandidate ? "/candidate/payment-failure" : "/employer/payment-failure";
        String status = params.getOrDefault("status", "0");

        log.info("[ZALOPAY-RETURN] appTransId={} orderCode={} isCandidate={} status={}",
                appTransId, orderCode, isCandidate, status);

        if (!"1".equals(status)) {
            String pmcId = params.getOrDefault("pmcid", "99");
            log.warn("[ZALOPAY-RETURN] non-success: status={} orderCode={}", status, orderCode);
            response.sendRedirect(frontendUrl + failurePath + "?reason=" + pmcId + "&gateway=ZALOPAY");
            return;
        }

        // status=1 → ZaloPay xác nhận thành công.
        // IPN không hoạt động với localhost → xử lý payment ngay tại đây.
        String zpTransId = params.get("zptransid");
        try {
            if (isCandidate)
                candidateCallbackUseCase.markSuccessByOrderCode(orderCode, zpTransId);
            else
                callbackUseCase.markSuccessByOrderCode(orderCode, zpTransId);

            log.info("[ZALOPAY-RETURN] Processed successfully: orderCode={}", orderCode);
        } catch (Exception e) {
            // Log lỗi nhưng vẫn redirect success vì ZaloPay đã confirm thanh toán
            log.error("[ZALOPAY-RETURN] Process error (payment may need manual check): orderCode={} error={}",
                    orderCode, e.getMessage(), e);
        }

        response.sendRedirect(frontendUrl + successPath);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Parse app_trans_id từ ZaloPay JSON "data".
     * Format: yyMMdd_orderCode_appTime → split("_", 3)[1] = orderCode
     */
    private boolean extractIsCandidate(String jsonData) {
        if (jsonData == null || jsonData.isBlank())
            return false;
        try {
            Map<?, ?> parsed = new com.fasterxml.jackson.databind.ObjectMapper()
                    .readValue(jsonData, Map.class);
            String appTransId = (String) parsed.get("app_trans_id");
            String orderCode = extractOrderCode(appTransId);
            return orderCode != null && orderCode.startsWith("CP-");
        } catch (Exception e) {
            log.warn("[ZALOPAY] Không parse được data: {}", e.getMessage());
            return false;
        }
    }

    /** yyMMdd_orderCode_appTime → orderCode (parts[1]) */
    private String extractOrderCode(String appTransId) {
        if (appTransId == null || appTransId.isBlank())
            return null;
        String[] parts = appTransId.split("_", 3);
        return parts.length >= 2 ? parts[1] : null;
    }
}