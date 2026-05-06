package edu.tlu.jobplatform.livestream.infrastructure.media;

import edu.tlu.jobplatform.livestream.application.port.out.MediaServerPort;
import io.livekit.server.AccessToken;
import io.livekit.server.CanPublish;
import io.livekit.server.CanPublishData;
import io.livekit.server.CanSubscribe;
import io.livekit.server.RoomJoin;
import io.livekit.server.RoomName;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@Slf4j
public class LiveKitMediaServerAdapter implements MediaServerPort {

    private static final long TTL_MS = 4 * 60 * 60 * 1000L; // 4 hours in milliseconds

    @Value("${livekit.api-key}")
    private String apiKey;

    @Value("${livekit.api-secret}")
    private String apiSecret;

    // MediaServerPort impl ─

    @Override
    public String generateHostToken(UUID sessionId, UUID userId) {
        return buildToken(roomName(sessionId), identity(userId, "host"),
                canPublish(true), canSubscribe(true));
    }

    @Override
    public String generateViewerToken(UUID sessionId, UUID userId) {
        return buildToken(roomName(sessionId), identity(userId, "viewer"),
                canPublish(false), canSubscribe(true));
    }

    @Override
    public String generateSpeakerToken(UUID sessionId, UUID userId) {
        return buildToken(roomName(sessionId), identity(userId, "speaker"),
                canPublish(true), canSubscribe(true));
    }

    @Override
    public void endRoom(UUID sessionId) {
        // Local dev: room closes automatically when all participants leave.
        // Production: inject RoomServiceClient and call deleteRoom().
        log.info("[LiveKit] Ending room: {}", roomName(sessionId));
    }

    @Override
    public String getRecordingUrl(UUID sessionId) {
        // Local dev: Egress not configured — returning null.
        // Production: LiveKit Egress uploads to S3; URL delivered via webhook.
        log.info("[LiveKit] getRecordingUrl — Egress not configured, returning null for session: {}", sessionId);
        return null;
    }

    // Private helpers ──

    private String buildToken(String room, String identity,
            boolean canPublish, boolean canSubscribe) {
        try {
            AccessToken token = new AccessToken(apiKey, apiSecret);
            token.setName(identity);
            token.setIdentity(identity);
            token.setTtl(TTL_MS); // milliseconds

            // Each permission is its own grant class — VideoGrant is not instantiable
            token.addGrants(
                    new RoomJoin(true),
                    new RoomName(room),
                    new CanPublish(canPublish),
                    new CanSubscribe(canSubscribe),
                    new CanPublishData(true) // enables chat / poll data messages
            );

            return token.toJwt();

        } catch (Exception e) {
            log.error("[LiveKit] Failed to generate token — identity={}, room={}: {}",
                    identity, room, e.getMessage());
            throw new RuntimeException("Failed to generate LiveKit token", e);
        }
    }

    private static boolean canPublish(boolean value) {
        return value;
    }

    private static boolean canSubscribe(boolean value) {
        return value;
    }

    private static String roomName(UUID sessionId) {
        return "session-" + sessionId;
    }

    private static String identity(UUID userId, String role) {
        return role + "-" + userId;
    }
}