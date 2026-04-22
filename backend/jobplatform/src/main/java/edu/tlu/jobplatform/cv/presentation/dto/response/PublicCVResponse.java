package edu.tlu.jobplatform.cv.presentation.dto.response;

import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

/**
 * Response cho /public/cv/{slug} — không cần auth.
 * Chỉ chứa visible sections, không lộ candidateId hay metadata nội bộ.
 */
@Getter
@Builder
public class PublicCVResponse {

    private UUID id;
    private String title;
    private UUID templateId;
    private PersonalInfoResponse personalInfo;
    private List<CVSectionResponse> sections; // chỉ visible sections
    private long viewCount;

    public static PublicCVResponse from(OnlineCV cv) {
        List<CVSectionResponse> visibleSections = cv.getVisibleSections()
                .stream()
                .map(CVSectionResponse::from)
                .toList();

        return PublicCVResponse.builder()
                .id(cv.getId())
                .title(cv.getTitle())
                .templateId(cv.getTemplateId())
                .personalInfo(PersonalInfoResponse.from(cv.getPersonalInfo()))
                .sections(visibleSections)
                .viewCount(cv.getViewCount())
                .build();
    }
}