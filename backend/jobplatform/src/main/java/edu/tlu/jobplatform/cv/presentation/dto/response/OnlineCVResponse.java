package edu.tlu.jobplatform.cv.presentation.dto.response;

import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.model.vo.CVStatus;
import edu.tlu.jobplatform.cv.domain.model.vo.CVVisibility;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response gọn cho danh sách CV (không bao gồm sections).
 * Dùng cho GET /api/v1/cv
 */
@Getter
@Builder
public class OnlineCVResponse {

    private UUID id;
    private String title;
    private UUID templateId;
    private PersonalInfoResponse personalInfo;
    private CVStatus status;
    private CVVisibility visibility;
    private String slug;
    private long viewCount;
    private String exportedPdfUrl;
    private int sectionCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OnlineCVResponse from(OnlineCV cv) {
        return OnlineCVResponse.builder()
                .id(cv.getId())
                .title(cv.getTitle())
                .templateId(cv.getTemplateId())
                .personalInfo(PersonalInfoResponse.from(cv.getPersonalInfo()))
                .status(cv.getStatus())
                .visibility(cv.getVisibility())
                .slug(cv.getSlug())
                .viewCount(cv.getViewCount())
                .exportedPdfUrl(cv.getExportedPdfUrl())
                .sectionCount(cv.getSections().size())
                .createdAt(cv.getCreatedAt())
                .updatedAt(cv.getUpdatedAt())
                .build();
    }
}