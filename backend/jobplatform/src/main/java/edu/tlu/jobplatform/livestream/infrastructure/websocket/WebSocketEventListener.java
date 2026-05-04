package edu.tlu.jobplatform.livestream.infrastructure.websocket;

import edu.tlu.jobplatform.livestream.application.service.StreamViewerManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Lắng nghe WebSocket lifecycle events để sync viewer count.
 *
 * Tracking strategy:
 * - wsSessionId → Set<sessionId> : một WS session có thể subscribe nhiều stream
 * topics
 * (edge case nhưng nên handle đúng)
 * - (wsSessionId, sessionId) → userId : để biết user nào cần notify khi
 * unsubscribe
 *
 * Quan hệ với JoinLiveStreamUseCase:
 * - HTTP join gọi viewerJoined() trước — đây là primary trigger
 * - WebSocket subscribe cũng gọi viewerJoined() — nhưng StreamViewerManager
 * dedup theo userId nên không tăng count 2 lần
 * - Khi WS disconnect/unsubscribe mới gọi viewerLeft()/viewerDisconnected()
 *
 * Pattern topic stream: /topic/stream/{sessionId}/events
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final StreamViewerManager viewerManager;

    private static final Pattern STREAM_TOPIC_PATTERN = Pattern.compile("^/topic/stream/([0-9a-fA-F\\-]{36})/events$");

    /**
     * (wsSessionId + ":" + sessionId) → userId
     * Key format: "{wsSessionId}:{sessionId}"
     */
    private final Map<String, UUID> subscriptionUserMap = new ConcurrentHashMap<>();

    // ─── Subscribe ────────────────

    @EventListener
    public void handleSubscribeEvent(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();
        if (destination == null)
            return;

        Matcher matcher = STREAM_TOPIC_PATTERN.matcher(destination);
        if (!matcher.matches())
            return;

        String wsSessionId = accessor.getSessionId();
        Principal principal = accessor.getUser();

        if (!isAuthenticated(principal)) {
            log.warn("[WS] Unauthenticated subscribe attempt to {}", destination);
            return;
        }

        UUID sessionId = parseUuid(matcher.group(1));
        UUID userId = extractUserIdFromPrincipal((Authentication) principal);
        if (sessionId == null || userId == null) {
            log.warn("[WS] Invalid UUIDs in destination: {}", destination);
            return;
        }

        String key = compositeKey(wsSessionId, sessionId);

        // putIfAbsent: nếu đã subscribe topic này rồi (same wsSession + sessionId)
        // thì không notify viewerManager thêm lần nữa
        UUID existing = subscriptionUserMap.putIfAbsent(key, userId);
        if (existing != null) {
            log.debug("[WS] Already subscribed key={}, skipping", key);
            return;
        }

        // viewerJoined() idempotent — dedup theo userId trong StreamViewerManager
        viewerManager.viewerJoined(sessionId, userId);
        log.debug("[WS] User {} subscribed to session {} (wsSession={})", userId, sessionId, wsSessionId);
    }

    // ─── Unsubscribe ──────────────

    @EventListener
    public void handleUnsubscribeEvent(SessionUnsubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();
        // destination có thể null khi unsubscribe bằng subscriptionId
        // Spring STOMP không luôn populate destination ở đây
        // → fallback: không xử lý unsubscribe riêng, để disconnect xử lý
        // Nếu cần handle: cần track wsSessionId→subscriptionId→destination
        if (destination == null)
            return;

        Matcher matcher = STREAM_TOPIC_PATTERN.matcher(destination);
        if (!matcher.matches())
            return;

        String wsSessionId = accessor.getSessionId();
        UUID sessionId = parseUuid(matcher.group(1));
        if (sessionId == null)
            return;

        String key = compositeKey(wsSessionId, sessionId);
        UUID userId = subscriptionUserMap.remove(key);
        if (userId == null)
            return;

        viewerManager.viewerLeft(sessionId, userId);
        log.debug("[WS] User {} unsubscribed from session {} (wsSession={})", userId, sessionId, wsSessionId);
    }

    // ─── Disconnect ───────────────

    @EventListener
    public void handleDisconnectEvent(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String wsSessionId = accessor.getSessionId();
        if (wsSessionId == null)
            return;

        // Tìm tất cả key thuộc wsSession này và cleanup
        String prefix = wsSessionId + ":";
        subscriptionUserMap.entrySet().removeIf(entry -> {
            if (!entry.getKey().startsWith(prefix))
                return false;

            String sessionIdStr = entry.getKey().substring(prefix.length());
            UUID sessionId = parseUuid(sessionIdStr);
            UUID userId = entry.getValue();

            if (sessionId != null && userId != null) {
                viewerManager.viewerLeft(sessionId, userId);
                log.debug("[WS] User {} left session {} on disconnect (wsSession={})",
                        userId, sessionId, wsSessionId);
            }
            return true;
        });
    }

    // ─── Helpers ──────────────────

    private boolean isAuthenticated(Principal principal) {
        return principal instanceof Authentication auth && auth.isAuthenticated();
    }

    private UUID parseUuid(String value) {
        if (value == null)
            return null;
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private UUID extractUserIdFromPrincipal(Authentication auth) {
        // Option 2: nếu JWT claims được set làm name
        return parseUuid(auth.getName());
    }

    private String compositeKey(String wsSessionId, UUID sessionId) {
        return wsSessionId + ":" + sessionId;
    }
}