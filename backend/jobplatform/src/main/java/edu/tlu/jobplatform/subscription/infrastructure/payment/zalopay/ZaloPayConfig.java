package edu.tlu.jobplatform.subscription.infrastructure.payment.zalopay;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "payment.zalopay")
public class ZaloPayConfig {
    private String appId;
    private String key1;
    private String key2;
    private String endpoint = "https://sb-openapi.zalopay.vn/v2/create";
    private String ipnUrl;
    private String redirectUrl; // <-- thêm
}