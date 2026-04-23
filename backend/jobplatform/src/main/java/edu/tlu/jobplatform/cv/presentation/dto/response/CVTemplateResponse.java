package edu.tlu.jobplatform.cv.presentation.dto.response;

import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class CVTemplateResponse {

    private UUID id;
    private String name;
    private String thumbnailUrl;
    private String category;
    private boolean premium;
    private String html_content;

    public static CVTemplateResponse from(CVTemplate t) {
        return CVTemplateResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .thumbnailUrl(t.getThumbnailUrl())
                .category(t.getCategory())
                .premium(t.isPremium())
                .html_content(t.getHtmlContent())
                .build();
    }
}