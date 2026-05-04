package edu.tlu.jobplatform.auth.infrastructure.adapter;

import edu.tlu.jobplatform.auth.application.port.out.TokenStorePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Adapter: implement TokenStorePort bằng Redis.
 *
 * Key design:
 * 
 * <pre>
 *   refresh:{userId}:{tokenId}  → JWT refresh token (TTL 30 ngày)
 *   blacklist:{jti}             → "1"               (TTL = remaining của access token)
 * </pre>
 *
 * Tại sao dùng userId trong key?
 * → KEYS refresh:{userId}:* cho phép xóa toàn bộ session của 1 user
 * → Tránh collision, dễ debug khi cần inspect Redis
 *
 * StringRedisTemplate bean được khai báo trong shared/config/RedisConfig.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RedisTokenStoreAdapter implements TokenStorePort {

    private final StringRedisTemplate redis;

    private static final String NS_REFRESH = "refresh:";
    private static final String NS_BLACKLIST = "blacklist:";

    @Override
    public void save(UUID userId, String tokenId, String token, Duration ttl) {
        redis.opsForValue().set(refreshKey(userId, tokenId), token, ttl);
    }

    @Override
    public Optional<String> find(UUID userId, String tokenId) {
        return Optional.ofNullable(
                redis.opsForValue().get(refreshKey(userId, tokenId)));
    }

    @Override
    public void delete(UUID userId, String tokenId) {
        redis.delete(refreshKey(userId, tokenId));
    }

    @Override
    public void deleteAll(UUID userId) {
        Set<String> keys = redis.keys(NS_REFRESH + userId + ":*");
        if (keys != null && !keys.isEmpty()) {
            redis.delete(keys);
            log.debug("Deleted {} sessions for user {}", keys.size(), userId);
        }
    }

    @Override
    public void blacklist(String jti, Duration ttl) {
        redis.opsForValue().set(NS_BLACKLIST + jti, "1", ttl);
    }

    @Override
    public boolean isBlacklisted(String jti) {
        return Boolean.TRUE.equals(redis.hasKey(NS_BLACKLIST + jti));
    }

    // ── Helper ────────

    private String refreshKey(UUID userId, String tokenId) {
        return NS_REFRESH + userId + ":" + tokenId;
    }
}
