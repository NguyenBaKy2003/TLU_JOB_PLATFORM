package edu.tlu.jobplatform.cv.application.port.out;

import java.util.UUID;

/**
 * Port ra ngoài — lưu trữ file PDF đã render lên object storage (S3).
 * Implementation: S3CVStorageAdapter (infra layer).
 */
public interface CVStoragePort {

    /**
     * Lưu PDF bytes lên storage.
     *
     * @param candidateId dùng làm prefix trong S3 key
     * @param cvId        dùng làm tên file
     * @param pdfBytes    nội dung PDF
     * @return public URL của file đã lưu
     */
    String store(UUID candidateId, UUID cvId, byte[] pdfBytes);

    /**
     * Xóa PDF đã lưu khi CV bị delete.
     *
     * @param pdfUrl URL của file cần xóa
     */
    void delete(String pdfUrl);
}