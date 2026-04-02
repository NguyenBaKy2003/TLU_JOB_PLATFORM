package edu.tlu.jobplatform.subscription.infrastructure.payment.vnpay;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Bind cấu hình VNPAY từ application.yml:
 *
 * payment:
 * vnpay:
 * tmn-code: YOUR_TMN_CODE
 * hash-secret: YOUR_HASH_SECRET
 * payment-url: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
 * version: "2.1.0"
 * command: pay
 * order-type: other
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "payment.vnpay")
public class VnpayConfig {

    private String tmnCode;
    private String hashSecret;
    private String paymentUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    private String version = "2.1.0";
    private String command = "pay";
    private String orderType = "other";
    private String locale = "vn";
    private String currCode = "VND";
}