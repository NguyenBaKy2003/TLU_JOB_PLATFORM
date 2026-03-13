package edu.tlu.jobplatform.auth.infrastructure.adapter;

import edu.tlu.jobplatform.auth.application.port.out.PasswordResetTokenPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

/**
 * Adapter: implement PasswordResetTokenPort bằng Redis.
 *
 * Redis key: "pwd_reset:{userId}"
 * Value:     UUID token string
 * TTL:       15 phút (định nghĩa trong PasswordResetTokenPort.TOKEN_TTL)
 *
 * Tại sao key theo userId (không phải token)?
 *   → 1 user chỉ có 1 token hợp lệ tại 1 thời điểm
 *   → Ghi đè tự động khi user request lại
 *   → Tra cứu O(1) khi verify: get(userId) → compare với token trong request
 *   → Không cần reverse lookup (token → userId)
 */
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
