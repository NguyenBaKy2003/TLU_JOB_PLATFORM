package edu.tlu.jobplatform.candidate.application.port.out;

import java.io.InputStream;

public interface FileStoragePort {

    /**
     * Upload file lên storage (S3 / Cloudinary / local).
     *
     * @param inputStream nội dung file
     * @param fileName    tên file gốc
     * @param contentType MIME type (application/pdf, ...)
     * @param folder      thư mục lưu trên storage ("cv", "avatar", ...)
     * @return public URL để truy cập file
     */
    String upload(InputStream inputStream, String fileName,
            String contentType, String folder);

    /**
     * Xóa file theo URL.
     */
    void delete(String fileUrl);
}