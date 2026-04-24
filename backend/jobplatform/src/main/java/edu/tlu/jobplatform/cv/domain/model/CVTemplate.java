package edu.tlu.jobplatform.cv.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Aggregate -- template CV do admin quan ly qua API.
 *
 * htmlContent luu toan bo XHTML hop le trong DB.
 * Khong con file classpath -- moi template deu qua Admin API.
 */
@Getter
@Builder
public class CVTemplate {

    private final UUID id;
    private String name;
    private String thumbnailUrl;
    private String category; // "professional" | "creative" | "simple"
    private boolean premium;
    private String htmlContent; // XHTML string day du, luu trong DB
    private boolean active; // false = an khoi danh sach candidate
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Business rules

    public void update(String name, String thumbnailUrl, String category,
            boolean premium, String htmlContent, boolean active) {
        this.name = name;
        this.thumbnailUrl = thumbnailUrl;
        this.category = category;
        this.premium = premium;
        this.htmlContent = htmlContent;
        this.active = active;
    }

    public void activate() {
        this.active = true;
    }

    public void deactivate() {
        this.active = false;
    }
}