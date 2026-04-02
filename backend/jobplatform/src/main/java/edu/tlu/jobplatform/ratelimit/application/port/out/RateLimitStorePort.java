package edu.tlu.jobplatform.ratelimit.application.port.out;

import java.time.Duration;

public interface RateLimitStorePort {

    /**
     * Tăng counter cho key, set TTL nếu key chưa tồn tại.
     * 
     * @return giá trị counter SAU khi tăng
     */
    long increment(String key, int windowSeconds);

    /**
     * TTL còn lại của key (để trả Retry-After header).
     */
    Duration ttl(String key);
}