package edu.tlu.jobplatform.cv.domain.model;

import edu.tlu.jobplatform.cv.domain.model.vo.SectionType;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * Entity bên trong OnlineCV aggregate.
 * Không tồn tại độc lập — luôn thuộc về một OnlineCV.
 *
 * content: JSON string, schema phụ thuộc vào type:
 * EXPERIENCE → [{ company, position, startDate, endDate, description }]
 * EDUCATION → [{ school, degree, major, startDate, endDate }]
 * SKILL → [{ name, level }]
 * PROJECT → [{ name, description, techStack, url }]
 * CERTIFICATE → [{ name, issuer, issuedAt, expiresAt, credentialUrl }]
 * LANGUAGE → [{ name, level }]
 * SUMMARY → { text }
 * CUSTOM → { title, body }
 */
@Getter
@Builder
public class CVSection {

    private final UUID id;
    private final UUID cvId;
    private final SectionType type;
    private String title; // Tiêu đề hiển thị, VD: "Kinh nghiệm làm việc"
    private String content; // JSON string
    private int displayOrder;
    private boolean visible;

    /** Cập nhật nội dung section */
    public void updateContent(String title, String content) {
        this.title = title;
        this.content = content;
    }

    /** Ẩn / hiện section trên CV */
    public void setVisible(boolean visible) {
        this.visible = visible;
    }

    /** Cập nhật thứ tự hiển thị */
    public void reorder(int newOrder) {
        this.displayOrder = newOrder;
    }
}