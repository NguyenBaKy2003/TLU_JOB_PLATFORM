package edu.tlu.jobplatform.shared.port;

import java.io.InputStream;

/**
 * Port để tương tác với file storage (S3, GCS, local...).
 * Implementation nằm ở infrastructure layer.
 */
public interface FileStoragePort {

    /**
     * Upload file lên storage.
     *
     * @param inputStream nội dung file
     * @param fileName    tên file gốc (dùng để sinh S3 key)
     * @param contentType MIME type
     * @param folder      thư mục (vd: "cv", "avatars")
     * @return URL đầy đủ của file trên storage
     */
    String upload(InputStream inputStream, String fileName, String contentType, String folder);

    /**
     * Tải file từ storage về dạng stream.
     *
     * @param fileUrl URL đầy đủ hoặc S3 key
     * @return FileResult chứa stream + metadata
     */
    FileResult download(String fileUrl);

    /**
     * Xóa file khỏi storage.
     *
     * @param fileUrl URL đầy đủ hoặc S3 key
     */
    void delete(String fileUrl);

    // ── Result record ─────────────────────────────────────────────────────────

    record FileResult(
            InputStream inputStream,
            String contentType,
            long contentLength) {
    }
}