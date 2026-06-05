package edu.tlu.jobplatform.subscription.infrastructure.payment.momo;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "payment.momo")
public class MomoConfig {
    private String partnerCode;
    private String accessKey;
    private String secretKey;
    private String endpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
    private String ipnUrl;
}