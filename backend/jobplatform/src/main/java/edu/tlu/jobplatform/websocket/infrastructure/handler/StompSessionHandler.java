package edu.tlu.jobplatform.websocket.infrastructure.handler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.Duration;

/**
 * Lưu userId → sessionId vào Redis khi connect/disconnect.
 * Dùng để:
 * - Biết user nào đang online (presence)
 * - Route message đúng instance khi scale (kết hợp với Redis Pub/Sub broker)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StompSessionHandler {

    private static final String ONLINE_KEY_PREFIX = "ws:online:";
    private static final Duration ONLINE_TTL = Duration.ofMinutes(30);

    private final StringRedisTemplate redis;

    @EventListener
    public void onConnect(SessionConnectedEvent event) {
        String userId = getUserId(event.getUser());
        if (userId == null)
            return;

        redis.opsForValue().set(ONLINE_KEY_PREFIX + userId, "1", ONLINE_TTL);
        log.debug("WS connected: userId={}", userId);
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        String userId = getUserId(event.getUser());
        if (userId == null)
            return;

        redis.delete(ONLINE_KEY_PREFIX + userId);
        log.debug("WS disconnected: userId={}", userId);
    }

    public boolean isOnline(String userId) {
        return Boolean.TRUE.equals(redis.hasKey(ONLINE_KEY_PREFIX + userId));
    }

    private String getUserId(java.security.Principal principal) {
        return principal != null ? principal.getName() : null;
    }
}