package edu.tlu.jobplatform.candidate.application.port.out;

import java.io.InputStream;

public interface FileStoragePort {

    /**
     * Upload file lên storage (S3).
     *
     * @param inputStream nội dung file
     * @param fileName    tên file gốc (dùng để đặt tên trên S3)
     * @param contentType MIME type
     * @param folder      thư mục đích trên S3 (vd: "cv", "avatars")
     * @return public URL hoặc S3 key của file vừa upload
     */
    String upload(InputStream inputStream, String fileName,
            String contentType, String folder);

    /**
     * Download file từ storage.
     *
     * @param fileUrl URL hoặc S3 key đã lưu trong DB
     * @return DownloadResult chứa stream và metadata
     */
    DownloadResult download(String fileUrl);

    /**
     * Xoá file khỏi storage.
     *
     * @param fileUrl URL hoặc S3 key
     */
    void delete(String fileUrl);

    record DownloadResult(
            InputStream inputStream,
            String contentType,
            long contentLength) {
    }
}