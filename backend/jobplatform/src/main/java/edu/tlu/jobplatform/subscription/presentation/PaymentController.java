package edu.tlu.jobplatform.subscription.presentation;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.subscription.application.usecase.HandlePaymentCallbackUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Webhook endpoints nhận callback từ VNPay.
 * KHÔNG cần JWT auth — được bảo vệ bằng HMAC signature.
 *
 * Endpoints:
 * GET /api/v1/payments/callback/vnpay/return — Redirect user về sau thanh toán
 * POST /api/v1/payments/callback/vnpay/ipn — IPN (server-to-server, không cần
 * redirect)
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/payments/callback")
@RequiredArgsConstructor
@Tag(name = "Payment Callback", description = "Webhook từ cổng thanh toán")
public class PaymentController {

    private final HandlePaymentCallbackUseCase callbackUseCase;

    /**
     * VNPay redirect user về đây sau khi thanh toán.
     * Dùng GET vì VNPay redirect bằng URL params.
     *
     * Sau khi xử lý → redirect user về frontend với kết quả.
     */
    @Operation(summary = "VNPay Return URL (redirect từ VNPay)")
    @GetMapping("/vnpay/return")
    public ResponseEntity<ApiResponse<String>> vnpayReturn(
            @RequestParam Map<String, String> params) {

        log.info("VNPay return callback: txnRef={}", params.get("vnp_TxnRef"));

        try {
            callbackUseCase.execute(params);
            return ResponseEntity.ok(
                    ApiResponse.success("Thanh toán thành công! Gói dịch vụ đã được kích hoạt."));
        } catch (Exception e) {
            log.error("VNPay return error: {}", e.getMessage());
            return ResponseEntity.ok(
                    ApiResponse.error("Thanh toán thất bại: " + e.getMessage(), "PAYMENT_FAILED"));
        }
    }

    /**
     * VNPay IPN — server-to-server notification (không qua browser).
     * Đây là endpoint chính để xử lý, vì user có thể đóng browser sớm.
     *
     * VNPay yêu cầu response body là "RspCode=00&Message=Confirm Success".
     */
    @Operation(summary = "VNPay IPN (server-to-server notification)")
    @PostMapping("/vnpay/ipn")
    public ResponseEntity<String> vnpayIpn(@RequestParam Map<String, String> params) {
        log.info("VNPay IPN received: txnRef={}", params.get("vnp_TxnRef"));
        try {
            callbackUseCase.execute(params);
            return ResponseEntity.ok("RspCode=00&Message=Confirm Success");
        } catch (BusinessRuleException e) {
            // Lỗi business (sai chữ ký, không tìm thấy đơn) — không cần retry
            log.warn("VNPay IPN business error: {}", e.getMessage());
            String rspCode = "INVALID_CALLBACK_SIGNATURE".equals(e.getErrorCode()) ? "97" : "02";
            return ResponseEntity.ok("RspCode=" + rspCode + "&Message=" + e.getMessage());
        } catch (Exception e) {
            // Lỗi hệ thống — VNPay sẽ retry
            log.error("VNPay IPN system error: {}", e.getMessage(), e);
            return ResponseEntity.ok("RspCode=99&Message=System Error");
        }
    }
}
