package edu.tlu.jobplatform.subscription.presentation;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
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
import java.util.TreeMap;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments/callback")
@RequiredArgsConstructor
@Tag(name = "Payment Callback", description = "Webhook từ cổng thanh toán")
public class PaymentController {

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    private final HandlePaymentCallbackUseCase callbackUseCase;

    @Operation(summary = "VNPay Return URL (redirect từ VNPay)")
    @GetMapping("/vnpay/return")
    public void vnpayReturn(
            @RequestParam Map<String, String> params,
            HttpServletResponse response) throws IOException {

        log.info("VNPay return callback: txnRef={}", params.get("vnp_TxnRef"));

        String responseCode = params.getOrDefault("vnp_ResponseCode", "99");
        if (!"00".equals(responseCode)) {
            log.warn("VNPay return non-success: responseCode={} txnRef={}",
                    responseCode, params.get("vnp_TxnRef"));
            response.sendRedirect(frontendUrl + "/payment/failure?reason=" + responseCode);
            return;
        }

        try {
            callbackUseCase.execute(params);
            response.sendRedirect(frontendUrl + "/payment/success");
        } catch (Exception e) {
            log.error("VNPay return error: {}", e.getMessage());
            response.sendRedirect(frontendUrl + "/payment/failure?reason=99");
        }
    }

    @Operation(summary = "VNPay IPN (server-to-server notification)")
    @PostMapping("/vnpay/ipn")
    public ResponseEntity<String> vnpayIpn(@RequestParam Map<String, String> params) {

        log.info("=== VNPAY IPN PARAMS (sorted) ===");
        new TreeMap<>(params).forEach((k, v) -> log.info("  [{}] = [{}]", k, v));
        log.info("=== END PARAMS ===");

        log.info("VNPay IPN received: txnRef={}", params.get("vnp_TxnRef"));

        try {
            callbackUseCase.execute(params);
            return ResponseEntity.ok("RspCode=00&Message=Confirm Success");
        } catch (BusinessRuleException e) {
            log.warn("VNPay IPN business error: {}", e.getMessage());
            String rspCode = "INVALID_CALLBACK_SIGNATURE".equals(e.getErrorCode()) ? "97" : "02";
            return ResponseEntity.ok("RspCode=" + rspCode + "&Message=" + e.getMessage());
        } catch (Exception e) {
            log.error("VNPay IPN system error: {}", e.getMessage(), e);
            return ResponseEntity.ok("RspCode=99&Message=System Error");
        }
    }
}