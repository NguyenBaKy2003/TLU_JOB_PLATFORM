package edu.tlu.jobplatform.candidate.infrastructure.file;

import edu.tlu.jobplatform.candidate.application.port.out.FileStoragePort;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class S3FileStorageAdapter implements FileStoragePort {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.region}")
    private String region;

    // ── Upload ────────────────────────────────────────────────────

    @Override
    public String upload(InputStream inputStream, String fileName,
            String contentType, String folder) {
        String key = buildKey(folder, fileName);

        try {
            byte[] bytes = inputStream.readAllBytes();

            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(contentType)
                    .contentLength((long) bytes.length)
                    .build();

            s3Client.putObject(request, RequestBody.fromBytes(bytes));

            String url = buildUrl(key);
            log.info("Uploaded to S3: key={} url={}", key, url);
            return url;

        } catch (Exception e) {
            log.error("S3 upload failed: key={} error={}", key, e.getMessage());
            throw new BusinessRuleException(
                    "Tải file lên thất bại. Vui lòng thử lại.", "FILE_UPLOAD_FAILED");
        }
    }

    // ── Delete ────────────────────────────────────────────────────

    @Override
    public void delete(String fileUrl) {
        String key = extractKeyFromUrl(fileUrl);
        if (key == null) {
            log.warn("Cannot extract S3 key from url={}", fileUrl);
            return;
        }

        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build());

            log.info("Deleted from S3: key={}", key);

        } catch (Exception e) {
            // Không throw — xóa file thất bại không nên block business flow
            log.error("S3 delete failed: key={} error={}", key, e.getMessage());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────

    /**
     * key pattern: {folder}/{uuid}_{originalFileName}
     * VD: cv/a1b2c3d4_my-resume.pdf
     */
    private String buildKey(String folder, String fileName) {
        String sanitized = fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
        return folder + "/" + UUID.randomUUID() + "_" + sanitized;
    }

    private String buildUrl(String key) {
        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
    }

    /**
     * Tách key từ URL dạng:
     * https://{bucket}.s3.{region}.amazonaws.com/{key}
     */
    private String extractKeyFromUrl(String url) {
        if (url == null || url.isBlank())
            return null;
        try {
            String prefix = "amazonaws.com/";
            int idx = url.indexOf(prefix);
            return idx >= 0 ? url.substring(idx + prefix.length()) : null;
        } catch (Exception e) {
            return null;
        }
    }
}