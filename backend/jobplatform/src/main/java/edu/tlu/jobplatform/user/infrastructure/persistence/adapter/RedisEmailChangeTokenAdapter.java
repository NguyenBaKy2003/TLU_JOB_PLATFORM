package edu.tlu.jobplatform.user.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.user.application.port.out.EmailChangeTokenPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisEmailChangeTokenAdapter implements EmailChangeTokenPort {

    private static final String NS = "email_change:";

    private final StringRedisTemplate redis;

    private String key(UUID userId) {
        return NS + userId;
    }

    @Override
    public void save(UUID userId, String newEmail, String token) {
        String value = newEmail + "|" + token;
        redis.opsForValue().set(key(userId), value, TOKEN_TTL);
        log.debug("Saved email change request for userId={}, ttl={}", userId, TOKEN_TTL);
    }

    @Override
    public Optional<EmailChangeRequest> find(UUID userId) {
        String value = redis.opsForValue().get(key(userId));
        if (value == null)
            return Optional.empty();

        String[] parts = value.split("\\|", 2);
        if (parts.length != 2) {
            log.warn("Malformed email change token for userId={}", userId);
            return Optional.empty();
        }

        return Optional.of(new EmailChangeRequest(parts[0], parts[1]));
    }

    @Override
    public void delete(UUID userId) {
        redis.delete(key(userId));
        log.debug("Deleted email change request for userId={}", userId);
    }
}