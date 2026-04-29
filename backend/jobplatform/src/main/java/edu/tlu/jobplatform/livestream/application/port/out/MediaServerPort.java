package edu.tlu.jobplatform.livestream.application.port.out;

import java.util.UUID;

/**
 * Interface giao tiếp với LiveKit (hoặc media server khác).
 * Infrastructure adapter sẽ implement.
 */
public interface MediaServerPort {

    /**
     * Tạo token cho HOST — có quyền publish video/audio.
     */
    String generateHostToken(UUID sessionId, UUID userId);

    /**
     * Tạo token cho VIEWER — chỉ subscribe.
     */
    String generateViewerToken(UUID sessionId, UUID userId);

    /**
     * Tạo token cho SPEAKER (interview) — có quyền publish.
     */
    String generateSpeakerToken(UUID sessionId, UUID userId);

    /**
     * Kết thúc room trên media server.
     */
    void endRoom(UUID sessionId);

    /**
     * Lấy URL recording sau khi session kết thúc.
     * LiveKit Egress sẽ upload lên S3, trả về URL.
     */
    String getRecordingUrl(UUID sessionId);
}