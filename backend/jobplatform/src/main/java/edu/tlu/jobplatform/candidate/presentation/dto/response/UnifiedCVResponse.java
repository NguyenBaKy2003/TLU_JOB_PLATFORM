package edu.tlu.jobplatform.candidate.presentation.dto.response;

import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class UnifiedCVResponse {

    public enum Source {
        UPLOADED, ONLINE
    }

    private UUID id;
    private String title;
    private Source source; // phân biệt loại CV
    private boolean primary;
    private String fileUrl; // chỉ có nếu UPLOADED
    private String slug; // chỉ có nếu ONLINE
    private String status; // chỉ có nếu ONLINE (DRAFT/PUBLISHED/ARCHIVED)
    private long viewCount; // chỉ có nếu ONLINE
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UnifiedCVResponse fromUploaded(CandidateCV cv) {
        return UnifiedCVResponse.builder()
                .id(cv.getId())
                .title(cv.getTitle())
                .source(Source.UPLOADED)
                .primary(cv.isPrimary())
                .fileUrl(cv.getFileUrl())
                .createdAt(cv.getCreatedAt())
                .updatedAt(cv.getUpdatedAt())
                .build();
    }

    public static UnifiedCVResponse fromOnline(OnlineCV cv) {
        return UnifiedCVResponse.builder()
                .id(cv.getId())
                .title(cv.getTitle())
                .source(Source.ONLINE)
                .primary(cv.isPrimary()) // ← fix: map đúng thay vì hardcode false
                .fileUrl(cv.getExportedPdfUrl())
                .slug(cv.getSlug())
                .status(cv.getStatus().name())
                .viewCount(cv.getViewCount())
                .createdAt(cv.getCreatedAt())
                .updatedAt(cv.getUpdatedAt())
                .build();
    }
}