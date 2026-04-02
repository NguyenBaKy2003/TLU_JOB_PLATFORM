package edu.tlu.jobplatform.subscription.presentation;

import edu.tlu.jobplatform.subscription.application.usecase.HandlePaymentCallbackUseCase;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller: Nhận callback (webhook) từ cổng thanh toán.
 *
 * Endpoints:
 * GET /api/v1/payments/callback/vnpay — VNPAY redirect sau khi thanh toán
 * POST /api/v1/payments/callback/momo — MOMO IPN webhook
 *
 * Security:
 * - KHÔNG cần JWT — gateway gọi trực tiếp.
 * - Bảo mật bằng HMAC signature verification bên trong UseCase.
 * - Endpoint này phải được whitelist trong SecurityConfig (permitAll).
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/payments/callback")
@RequiredArgsConstructor
@Tag(name = "Payment Callback", description = "Webhook nhận kết quả từ cổng thanh toán")
public class PaymentCallbackController {

    private final HandlePaymentCallbackUseCase handlePaymentCallbackUseCase;

    /**
     * GET /api/v1/payments/callback/vnpay
     *
     * VNPAY redirect user trở lại sau khi thanh toán (GET với query params).
     * Ví dụ:
     * /callback/vnpay?vnp_TxnRef=JP-A1B2C3&vnp_ResponseCode=00&vnp_SecureHash=...
     *
     * Sau khi xử lý, redirect user đến trang kết quả trên frontend.
     */
    @GetMapping("/vnpay")
    @Operation(summary = "VNPAY payment callback", description = "VNPAY redirect sau khi thanh toán xong")
    public ResponseEntity<ApiResponse<String>> vnpayCallback(HttpServletRequest request) {
        Map<String, String> params = extractQueryParams(request);
        log.info("VNPAY callback received: txnRef={}", params.get("vnp_TxnRef"));

        handlePaymentCallbackUseCase.execute(params);
        return ResponseEntity.ok(ApiResponse.success("Thanh toán đã được xử lý thành công."));
    }

    /**
     * POST /api/v1/payments/callback/momo
     *
     * MOMO gửi IPN (Instant Payment Notification) qua POST với JSON body.
     * Gateway cần nhận HTTP 200 để xác nhận đã xử lý.
     */
    @PostMapping("/momo")
    @Operation(summary = "MOMO IPN callback", description = "MOMO Instant Payment Notification")
    public ResponseEntity<ApiResponse<String>> momoCallback(
            @RequestBody Map<String, String> callbackParams) {
        log.info("MOMO callback received: orderId={}", callbackParams.get("orderId"));

        handlePaymentCallbackUseCase.execute(callbackParams);
        return ResponseEntity.ok(ApiResponse.success("IPN received."));
    }

    /**
     * Chuyển toàn bộ query parameters từ HttpServletRequest sang Map<String,
     * String>.
     * VNPAY truyền tất cả data qua query string.
     */
    private Map<String, String> extractQueryParams(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        request.getParameterMap().forEach((key, values) -> {
            if (values != null && values.length > 0) {
                params.put(key, values[0]);
            }
        });
        return params;
    }
}
