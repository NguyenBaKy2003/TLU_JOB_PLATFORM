package edu.tlu.jobplatform.livestream.application.port.out;

import java.util.UUID;

public interface StreamStoragePort {
    /**
     * Move/copy recording từ media server storage sang S3 CDN của mình.
     * 
     * @return CDN URL public để stream replay
     */
    String storeRecording(UUID sessionId, String sourceUrl);
}