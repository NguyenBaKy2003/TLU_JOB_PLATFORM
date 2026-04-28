package edu.tlu.jobplatform.company.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Tài liệu pháp lý công ty nộp để admin xem khi xét duyệt hồ sơ.
 * Không có workflow duyệt — admin xem trực tiếp trong detail công ty.
 */
@Getter
@Builder
public class CompanyDocument {

    private final UUID id;
    private final UUID companyId;

    private CompanyDocumentType type;
    private String fileName;
    private String fileUrl;
    private String mimeType;
    private long fileSizeBytes;

    private final LocalDateTime uploadedAt;

    /** Company nộp lại tài liệu mới (ghi đè file cũ cùng type) */
    public void resubmit(String fileUrl, String fileName,
            String mimeType, long fileSizeBytes) {
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.mimeType = mimeType;
        this.fileSizeBytes = fileSizeBytes;
    }
}