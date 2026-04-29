// src/main/java/edu/tlu/jobplatform/livestream/infrastructure/websocket/WebSocketEventListener.java
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

import java.security.Principal;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final StreamViewerManager viewerManager;

    // Map WebSocket session ID to (sessionId, userId)
    private final Map<String, SessionInfo> wsSessionMap = new ConcurrentHashMap<>();

    @EventListener
    public void handleSubscribeEvent(SessionSubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = headerAccessor.getDestination();

        // Check if subscribing to stream events (viewer count updates)
        // Pattern: /topic/stream/{sessionId}/events
        if (destination != null && destination.matches("/topic/stream/[^/]+/events")) {
            String wsSessionId = headerAccessor.getSessionId();
            Principal principal = headerAccessor.getUser();

            if (principal instanceof Authentication auth && auth.isAuthenticated()) {
                try {
                    // Extract session ID from destination: /topic/stream/{sessionId}/events
                    String[] parts = destination.split("/");
                    UUID sessionId = UUID.fromString(parts[3]);
                    UUID userId = UUID.fromString(auth.getName());

                    // Store mapping for disconnect handling
                    wsSessionMap.put(wsSessionId, new SessionInfo(sessionId, userId));

                    log.debug("WebSocket session {} subscribed to stream {} events by user {}",
                            wsSessionId, sessionId, userId);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid session ID in destination: {}", destination);
                }
            }
        }
    }

    @EventListener
    public void handleDisconnectEvent(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String wsSessionId = headerAccessor.getSessionId();

        SessionInfo sessionInfo = wsSessionMap.remove(wsSessionId);
        if (sessionInfo != null) {
            viewerManager.viewerLeft(sessionInfo.sessionId, sessionInfo.userId);
            log.debug("User {} disconnected from session {}", sessionInfo.userId, sessionInfo.sessionId);
        }
    }

    private record SessionInfo(UUID sessionId, UUID userId) {
    }
}