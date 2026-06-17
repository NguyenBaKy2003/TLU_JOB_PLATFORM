package edu.tlu.jobplatform.auth.infrastructure.adapter;

import edu.tlu.jobplatform.auth.application.port.out.PasswordResetTokenPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisPasswordResetTokenAdapter implements PasswordResetTokenPort {

    private final StringRedisTemplate redis;
    private static final String KEY_PREFIX = "pwd_reset:";

    @Override
    public void save(UUID userId, String token) {
        redis.opsForValue().set(key(userId), token, TOKEN_TTL);
        log.debug("Reset token saved for userId={}, TTL={}m", userId, TOKEN_TTL.toMinutes());
    }

    @Override
    public Optional<String> find(UUID userId) {
        return Optional.ofNullable(redis.opsForValue().get(key(userId)));
    }

    @Override
    public void delete(UUID userId) {
        redis.delete(key(userId));
        log.debug("Reset token deleted for userId={}", userId);
    }

    private String key(UUID userId) {
        return KEY_PREFIX + userId;
    }
}
