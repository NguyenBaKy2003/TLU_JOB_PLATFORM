package edu.tlu.jobplatform.cv.presentation.dto.response;

import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * Response cho admin — bao gồm htmlContent và active.
 * Candidate dùng CVTemplateResponse (không có htmlContent).
 */
@Getter
@Builder
public class AdminCVTemplateResponse {

    private UUID id;
    private String name;
    private String thumbnailUrl;
    private String category;
    private boolean premium;
    private boolean active;
    private boolean dbDriven; // true = HTML từ DB, false = file classpath
    private String htmlContent; // full HTML — chỉ trả trong GET detail, không trả trong list

    public static AdminCVTemplateResponse from(CVTemplate t) {
        return AdminCVTemplateResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .thumbnailUrl(t.getThumbnailUrl())
                .category(t.getCategory())
                .premium(t.isPremium())
                .active(t.isActive())
                .htmlContent(t.getHtmlContent())
                .build();
    }

    /** List view — bỏ htmlContent để tránh response quá lớn */
    public static AdminCVTemplateResponse fromList(CVTemplate t) {
        return AdminCVTemplateResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .thumbnailUrl(t.getThumbnailUrl())
                .category(t.getCategory())
                .premium(t.isPremium())
                .active(t.isActive())
                .htmlContent(null) // ẩn trong list
                .build();
    }
}