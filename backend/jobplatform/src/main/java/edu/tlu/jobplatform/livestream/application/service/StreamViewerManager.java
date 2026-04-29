package edu.tlu.jobplatform.livestream.application.service;

import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.livestream.infrastructure.realtime.StreamEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class StreamViewerManager {

    private final LiveStreamSessionRepository sessionRepository;
    private final StreamEventPublisher eventPublisher;

    // Track active viewers: viewerId -> sessionId
    private final Map<UUID, UUID> activeViewers = new ConcurrentHashMap<>();

    // Track viewer count per session
    private final Map<UUID, Integer> sessionViewerCount = new ConcurrentHashMap<>();

    /**
     * Called when viewer joins
     */
    public int viewerJoined(UUID sessionId, UUID viewerId) {
        // Check if viewer was in another session
        UUID previousSession = activeViewers.remove(viewerId);
        if (previousSession != null && !previousSession.equals(sessionId)) {
            decrementSessionCount(previousSession);
        }

        // Add to new session
        activeViewers.put(viewerId, sessionId);

        // Increment count
        int newCount = incrementSessionCount(sessionId);

        // Update database
        updateDatabaseCount(sessionId, newCount);

        // Broadcast via existing StreamEventPublisher
        eventPublisher.publishViewerCount(sessionId, newCount);

        log.debug("Viewer {} joined session {}, count: {}", viewerId, sessionId, newCount);
        return newCount;
    }

    /**
     * Called when viewer leaves
     */
    public int viewerLeft(UUID sessionId, UUID viewerId) {
        if (activeViewers.remove(viewerId, sessionId)) {
            int newCount = decrementSessionCount(sessionId);

            // Update database
            updateDatabaseCount(sessionId, newCount);

            // Broadcast via existing StreamEventPublisher
            eventPublisher.publishViewerCount(sessionId, newCount);

            log.debug("Viewer {} left session {}, count: {}", viewerId, sessionId, newCount);
            return newCount;
        }
        return getCurrentViewerCount(sessionId);
    }

    /**
     * Get current viewer count for a session
     */
    public int getCurrentViewerCount(UUID sessionId) {
        return sessionViewerCount.getOrDefault(sessionId, 0);
    }

    private int incrementSessionCount(UUID sessionId) {
        return sessionViewerCount.merge(sessionId, 1, Integer::sum);
    }

    private int decrementSessionCount(UUID sessionId) {
        return sessionViewerCount.merge(sessionId, -1, (old, delta) -> {
            int updated = old + delta;
            return Math.max(0, updated);
        });
    }

    private void updateDatabaseCount(UUID sessionId, int count) {
        sessionRepository.findById(sessionId).ifPresent(session -> {
            try {
                // Sync database count with memory count
                int currentDbCount = session.getViewerCount();
                if (count != currentDbCount) {
                    if (count > currentDbCount) {
                        int diff = count - currentDbCount;
                        for (int i = 0; i < diff; i++) {
                            session.incrementViewerCount();
                        }
                    } else {
                        int diff = currentDbCount - count;
                        for (int i = 0; i < diff; i++) {
                            session.decrementViewerCount();
                        }
                    }
                    sessionRepository.save(session);
                    log.debug("Updated database viewer count for session {}: {} -> {}",
                            sessionId, currentDbCount, count);
                }
            } catch (Exception e) {
                log.error("Failed to update viewer count for session {}", sessionId, e);
            }
        });
    }

    /**
     * Clean up when session ends
     */
    public void cleanupSession(UUID sessionId) {
        // Remove all viewers from this session
        activeViewers.entrySet().removeIf(entry -> entry.getValue().equals(sessionId));
        sessionViewerCount.remove(sessionId);

        // Final broadcast
        eventPublisher.publishViewerCount(sessionId, 0);
        log.info("Cleaned up session {}", sessionId);
    }
}