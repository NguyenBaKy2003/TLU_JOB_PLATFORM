package edu.tlu.jobplatform.ratelimit.infrastructure.adapter;

import edu.tlu.jobplatform.ratelimit.application.port.out.RateLimitStorePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisRateLimitAdapter implements RateLimitStorePort {

    private static final String KEY_PREFIX = "rl:";

    private final StringRedisTemplate redis;

    @Override
    public long increment(String key, int windowSeconds) {
        String redisKey = KEY_PREFIX + key;
        Long count = redis.opsForValue().increment(redisKey);
        if (count == null)
            count = 1L;

        if (count == 1) {
            redis.expire(redisKey, windowSeconds, TimeUnit.SECONDS);
        }
        return count;
    }

    @Override
    public Duration ttl(String key) {
        Long seconds = redis.getExpire(KEY_PREFIX + key, TimeUnit.SECONDS);
        if (seconds == null || seconds <= 0)
            return Duration.ofSeconds(1);
        return Duration.ofSeconds(seconds);
    }
}