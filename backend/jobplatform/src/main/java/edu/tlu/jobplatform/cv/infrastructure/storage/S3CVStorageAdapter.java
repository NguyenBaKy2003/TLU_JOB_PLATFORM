package edu.tlu.jobplatform.cv.infrastructure.storage;

import edu.tlu.jobplatform.cv.application.port.out.CVStoragePort;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.util.UUID;

/**
 * Implements CVStoragePort — lưu / xóa PDF đã render trên AWS S3.
 *
 * S3 key pattern: cv-exports/{candidateId}/{cvId}.pdf
 * → Mỗi lần export cùng CV đều ghi đè file cũ (idempotent).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class S3CVStorageAdapter implements CVStoragePort {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region; // ← đổi từ "baseUrl" thành "region" cho đúng nghĩa

    private static final String FOLDER = "cv-exports";

    @Override
    public String store(UUID candidateId, UUID cvId, byte[] pdfBytes) {
        String key = buildKey(candidateId, cvId);
        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType("application/pdf")
                    .contentDisposition("inline; filename=\"cv-" + cvId.toString().substring(0, 8) + ".pdf\"")
                    .build();

            s3Client.putObject(request, RequestBody.fromBytes(pdfBytes));

            String url = buildUrl(key); // ← dùng buildUrl() như FileStorageAdapter
            log.info("CV PDF stored: key={} size={}KB", key, pdfBytes.length / 1024);
            return url;

        } catch (Exception e) {
            log.error("Failed to store CV PDF: key={} error={}", key, e.getMessage(), e);
            throw new BusinessRuleException(
                    "Không thể lưu file PDF. Vui lòng thử lại.", "CV_STORAGE_FAILED");
        }
    }

    @Override
    public void delete(String pdfUrl) {
        String key = extractKeyFromUrl(pdfUrl); // ← dùng extractKeyFromUrl() như FileStorageAdapter
        if (key == null) {
            log.warn("Cannot extract S3 key from url={}", pdfUrl);
            return;
        }
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build());
            log.info("CV PDF deleted: key={}", key);
        } catch (Exception e) {
            log.warn("Failed to delete CV PDF: key={} error={}", key, e.getMessage());
        }
    }

    // ── Helpers (copy y chang từ S3FileStorageAdapter) ────────────────────────

    private String buildKey(UUID candidateId, UUID cvId) {
        return FOLDER + "/" + candidateId + "/" + cvId + ".pdf";
    }

    private String buildUrl(String key) {
        return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + key;
    }

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