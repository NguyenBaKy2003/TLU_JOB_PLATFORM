package edu.tlu.jobplatform.livestream.infrastructure.storage;

import edu.tlu.jobplatform.livestream.application.port.out.StreamStoragePort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * LOCAL PROFILE: Lưu recording vào thư mục local thay vì S3.
 * Dùng khi test với ngrok — file được serve qua Spring static resource.
 *
 * Khi production: tạo S3StreamStorageAdapter với @Profile("prod")
 */
@Component
@Profile("local")
@Slf4j
public class LocalStreamStorageAdapter implements StreamStoragePort {

    @Value("${app.storage.local-path:${user.home}/jobplatform/recordings}")
    private String localStoragePath;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Override
    public String storeRecording(UUID sessionId, String sourceUrl) {
        if (sourceUrl == null || sourceUrl.isBlank()) {
            log.warn("[Storage] sourceUrl rỗng cho session {}, bỏ qua", sessionId);
            return null;
        }

        try {
            Path dir = Paths.get(localStoragePath);
            Files.createDirectories(dir);

            String filename = "session-" + sessionId + ".mp4";
            Path dest = dir.resolve(filename);

            // Download file từ sourceUrl (LiveKit S3) về local
            try (InputStream in = URI.create(sourceUrl).toURL().openStream()) {
                Files.copy(in, dest, StandardCopyOption.REPLACE_EXISTING);
            }

            String publicUrl = baseUrl + "/recordings/" + filename;
            log.info("[Storage] Đã lưu recording session {} tại: {}", sessionId, publicUrl);
            return publicUrl;

        } catch (Exception e) {
            log.error("[Storage] Lỗi lưu recording session {}: {}", sessionId, e.getMessage(), e);
            throw new RuntimeException("Không thể lưu recording", e);
        }
    }
}