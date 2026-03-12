package edu.tlu.jobplatform.auth.infrastructure.persistence;

import edu.tlu.jobplatform.auth.application.port.out.OtpStorePort;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;

/**
 * RedisOtpStore — implement OtpStorePort bằng Redis.
 *
 * Key: otp:{purpose}:{email}
 * VD: otp:verify-email:user@example.com
 */
@Component
@RequiredArgsConstructor
public class RedisOtpStore implements OtpStorePort {

    private final StringRedisTemplate redis;

    private static final String PREFIX = "otp:";

    @Override
    public void save(String purpose, String email, String otp, Duration ttl) {
        redis.opsForValue().set(key(purpose, email), otp, ttl);
    }

    @Override
    public Optional<String> find(String purpose, String email) {
        return Optional.ofNullable(redis.opsForValue().get(key(purpose, email)));
    }

    @Override
    public void delete(String purpose, String email) {
        redis.delete(key(purpose, email));
    }

    private String key(String purpose, String email) {
        return PREFIX + purpose + ":" + email.toLowerCase().trim();
    }
}