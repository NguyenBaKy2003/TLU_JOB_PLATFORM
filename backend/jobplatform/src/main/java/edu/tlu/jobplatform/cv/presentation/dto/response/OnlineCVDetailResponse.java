package edu.tlu.jobplatform.cv.presentation.dto.response;

import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.model.vo.CVStatus;
import edu.tlu.jobplatform.cv.domain.model.vo.CVVisibility;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response đầy đủ dùng cho màn hình chỉnh sửa CV.
 * Bao gồm TẤT CẢ sections (kể cả visible = false).
 */
@Getter
@Builder
public class OnlineCVDetailResponse {

    private UUID id;
    private String title;
    private UUID templateId;
    private PersonalInfoResponse personalInfo;
    private List<CVSectionResponse> sections; // tất cả sections
    private CVStatus status;
    private CVVisibility visibility;
    private String slug;
    private long viewCount;
    private String exportedPdfUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OnlineCVDetailResponse from(OnlineCV cv) {
        List<CVSectionResponse> sections = cv.getSections().stream()
                .sorted(java.util.Comparator.comparingInt(
                        edu.tlu.jobplatform.cv.domain.model.CVSection::getDisplayOrder))
                .map(CVSectionResponse::from)
                .toList();

        return OnlineCVDetailResponse.builder()
                .id(cv.getId())
                .title(cv.getTitle())
                .templateId(cv.getTemplateId())
                .personalInfo(PersonalInfoResponse.from(cv.getPersonalInfo()))
                .sections(sections)
                .status(cv.getStatus())
                .visibility(cv.getVisibility())
                .slug(cv.getSlug())
                .viewCount(cv.getViewCount())
                .exportedPdfUrl(cv.getExportedPdfUrl())
                .createdAt(cv.getCreatedAt())
                .updatedAt(cv.getUpdatedAt())
                .build();
    }
}