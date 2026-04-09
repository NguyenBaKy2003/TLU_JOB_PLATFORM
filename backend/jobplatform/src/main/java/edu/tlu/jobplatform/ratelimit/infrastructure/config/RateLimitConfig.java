package edu.tlu.jobplatform.ratelimit.infrastructure.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.domain.service.RateLimitDomainService;
import edu.tlu.jobplatform.ratelimit.infrastructure.filter.RateLimitFilter;
import lombok.Data;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.HashMap;
import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "rate-limit")
@Data
public class RateLimitConfig {

    private Map<String, PolicyProperties> policies = new HashMap<>();

    @Bean
    public Map<String, RateLimitPolicy> rateLimitPolicies() {
        Map<String, RateLimitPolicy> result = new HashMap<>();
        policies.forEach((name, props) -> result.put(name, RateLimitPolicy.builder()
                .name(name)
                .maxRequests(props.getMax())
                .windowSeconds(props.getWindow())
                .scope(props.getScope())
                .build()));
        return result;
    }

    @Bean
    public RateLimitFilter rateLimitFilter(
            @Qualifier("requestMappingHandlerMapping") RequestMappingHandlerMapping handlerMapping,
            RateLimitDomainService rateLimitService,
            Map<String, RateLimitPolicy> rateLimitPolicies,
            ObjectMapper objectMapper) {
        return new RateLimitFilter(handlerMapping, rateLimitService, rateLimitPolicies, objectMapper);
    }

    @Data
    public static class PolicyProperties {
        private int max;
        private int window;
        private RateLimitPolicy.Scope scope = RateLimitPolicy.Scope.IP;
    }
}