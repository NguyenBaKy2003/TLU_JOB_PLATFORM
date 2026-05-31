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

    @Operation(summary = "VNPay Return URL (redirect từ VNPay)")
    @GetMapping("/vnpay/return")
    @Loggable(action = "PAYMENT_VNPAY_RETURN", resourceType = "Payment")
    public void vnpayReturn(
            @RequestParam Map<String, String> params,
            HttpServletResponse response) throws IOException {

        String txnRef = params.get("vnp_TxnRef");
        boolean isCandidate = txnRef != null && txnRef.startsWith("CP-");
        String successPath = isCandidate ? "/candidate/payment-success" : "/employer/payment-success";
        String failurePath = isCandidate ? "/candidate/payment-failure" : "/employer/payment-failure";

        log.info("VNPay return callback: txnRef={}", txnRef);

        String responseCode = params.getOrDefault("vnp_ResponseCode", "99");
        if (!"00".equals(responseCode)) {
            log.warn("VNPay return non-success: responseCode={} txnRef={}", responseCode, txnRef);
            response.sendRedirect(frontendUrl + failurePath + "?reason=" + responseCode);
            return;
        }

        try {
            if (isCandidate)
                candidateCallbackUseCase.execute(params);
            else
                callbackUseCase.execute(params);
            response.sendRedirect(frontendUrl + successPath);
        } catch (Exception e) {
            log.error("VNPay return error: {}", e.getMessage(), e);
            response.sendRedirect(frontendUrl + failurePath + "?reason=99");
        }
    }

    @Operation(summary = "VNPay IPN (server-to-server notification)")
    @PostMapping("/vnpay/ipn")
    @Loggable(action = "PAYMENT_VNPAY_IPN", resourceType = "Payment")
    public ResponseEntity<String> vnpayIpn(@RequestParam Map<String, String> params) {

        String txnRef = params.get("vnp_TxnRef");
        boolean isCandidate = txnRef != null && txnRef.startsWith("CP-");

        log.info("VNPay IPN received: txnRef={}", txnRef);

        try {
            if (isCandidate)
                candidateCallbackUseCase.execute(params);
            else
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