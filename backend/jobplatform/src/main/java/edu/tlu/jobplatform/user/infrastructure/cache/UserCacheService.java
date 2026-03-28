package edu.tlu.jobplatform.user.infrastructure.cache;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Cache thông tin User vào Redis để giảm số lần query PostgreSQL.
 *
 * Pattern: Cache-Aside (Lazy Loading)
 * - READ: tìm cache → miss → query DB → write cache
 * - WRITE: update DB → evict cache (không update cache trực tiếp)
 * - Evict khi: user update profile, bị deactivate, đổi role
 *
 * Redis key: "user:{userId}"
 * TTL: 10 phút (ngắn vì profile ít thay đổi nhưng cần freshness)
 * Format: JSON (dùng ObjectMapper, không lưu object Java thô)
 *
 * Lý do không dùng @Cacheable:
 * - Domain UseCase không có annotation Spring — giữ đúng Clean Architecture
 * - Cần kiểm soát eviction tường minh sau update/deactivate
 * - Dễ test hơn khi mock UserCacheService trực tiếp
 */
@Slf4j
@Service
public class UserCacheService {

    private static final String KEY_PREFIX = "user:";
    private static final Duration TTL = Duration.ofMinutes(10);

    private final StringRedisTemplate redis;
    private final ObjectMapper mapper;

    public UserCacheService(StringRedisTemplate redis) {
        this.redis = redis;
        this.mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule());
    }

    // ── Read ──────────────────────────────────────────────────────

    /**
     * Lấy User từ cache.
     * Trả về Optional.empty() nếu cache miss hoặc deserialize lỗi.
     */
    public Optional<User> get(UUID userId) {
        try {
            String json = redis.opsForValue().get(key(userId));
            if (json == null)
                return Optional.empty();

            CachedUser cached = mapper.readValue(json, CachedUser.class);
            return Optional.of(cached.toDomain());

        } catch (Exception e) {
            // Cache lỗi không được ảnh hưởng đến business flow
            log.warn("Cache read failed for user {}: {}", userId, e.getMessage());
            return Optional.empty();
        }
    }

    // ── Write ─────────────────────────────────────────────────────

    /**
     * Lưu User vào cache.
     * Chỉ cache các field cần thiết — không cache passwordHash.
     */
    public void put(User user) {
        try {
            String json = mapper.writeValueAsString(CachedUser.from(user));
            redis.opsForValue().set(key(user.getId()), json, TTL);
        } catch (JsonProcessingException e) {
            log.warn("Cache write failed for user {}: {}", user.getId(), e.getMessage());
        }
    }

    // ── Evict ─────────────────────────────────────────────────────

    /**
     * Xóa cache của user — gọi sau mỗi lần update hoặc deactivate.
     * Lần query tiếp theo sẽ load lại từ DB.
     */
    public void evict(UUID userId) {
        redis.delete(key(userId));
        log.debug("Cache evicted for user: {}", userId);
    }

    // ── Helper ────────────────────────────────────────────────────

    private String key(UUID userId) {
        return KEY_PREFIX + userId;
    }

    // ── Cached DTO (serializable, không có passwordHash) ─────────

    /**
     * Chỉ cache những field cần thiết để render UI.
     * KHÔNG bao giờ cache passwordHash vào Redis.
     */
    record CachedUser(
            UUID id,
            String email,
            String fullName,
            String avatarUrl,
            UserRole role,
            boolean active,
            boolean verified,
            LocalDateTime lastLoginAt,
            LocalDateTime createdAt) {
        static CachedUser from(User u) {
            return new CachedUser(
                    u.getId(), u.getEmail(), u.getFullName(),
                    u.getAvatarUrl(), u.getRole(),
                    u.isActive(), u.isVerified(),
                    u.getLastLoginAt(), u.getCreatedAt());
        }

        User toDomain() {
            return User.builder()
                    .id(id).email(email).fullName(fullName)
                    .avatarUrl(avatarUrl).role(role)
                    .active(active).verified(verified)
                    .lastLoginAt(lastLoginAt).createdAt(createdAt)
                    .passwordHash(null) // không cache password — load từ DB nếu cần
                    .build();
        }
    }
}