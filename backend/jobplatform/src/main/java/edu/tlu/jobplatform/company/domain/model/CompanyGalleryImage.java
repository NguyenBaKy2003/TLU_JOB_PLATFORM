package edu.tlu.jobplatform.company.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Ảnh giới thiệu công ty — hiển thị dạng gallery trên trang công ty.
 */
@Getter
@Builder
public class CompanyGalleryImage {

    private final UUID id;
    private final UUID companyId;

    private String imageUrl;
    private String caption;
    private int displayOrder;

    private final LocalDateTime uploadedAt;

    public void updateCaption(String caption) {
        this.caption = caption;
    }

    public void updateOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }
}