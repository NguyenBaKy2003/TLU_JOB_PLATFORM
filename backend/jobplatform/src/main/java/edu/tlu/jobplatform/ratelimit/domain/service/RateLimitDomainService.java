package edu.tlu.jobplatform.ratelimit.domain.service;

import edu.tlu.jobplatform.ratelimit.application.port.out.RateLimitStorePort;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RateLimitDomainService {

    private final RateLimitStorePort store;

    /**
     * Kiểm tra và tăng counter.
     * 
     * @return kết quả chứa trạng thái allow/deny + metadata
     */
    public Result check(String resolvedKey, RateLimitPolicy policy) {
        long count = store.increment(resolvedKey, policy.getWindowSeconds());
        boolean allowed = count <= policy.getMaxRequests();
        Duration retryAfter = allowed ? Duration.ZERO : store.ttl(resolvedKey);
        return new Result(allowed, count, policy.getMaxRequests(), retryAfter);
    }

    public record Result(
            boolean allowed,
            long currentCount,
            int limit,
            Duration retryAfter) {
    }
}