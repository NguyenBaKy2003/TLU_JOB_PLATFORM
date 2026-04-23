package edu.tlu.jobplatform.cv.presentation.dto.response;

import edu.tlu.jobplatform.cv.domain.model.CVSection;
import edu.tlu.jobplatform.cv.domain.model.vo.SectionType;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class CVSectionResponse {

    private UUID id;
    private SectionType type;
    private String title;
    private String content;
    private int displayOrder;
    private boolean visible;

    public static CVSectionResponse from(CVSection s) {
        return CVSectionResponse.builder()
                .id(s.getId())
                .type(s.getType())
                .title(s.getTitle())
                .content(s.getContent())
                .displayOrder(s.getDisplayOrder())
                .visible(s.isVisible())
                .build();
    }
}