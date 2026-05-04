package edu.tlu.jobplatform.candidate.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Một CV của candidate.
 * Có thể là: uploaded file (PDF/DOC) hoặc online CV (tạo trên hệ thống).
 */
@Getter
@Builder
public class CandidateCV {

    public enum CVType {
        UPLOADED, ONLINE
    }

    private final UUID id;
    private final UUID candidateId;
    private String title;
    private CVType type;
    private String fileUrl; // null nếu ONLINE
    private String parsedContent; // text extract từ PDF
    private boolean primary; // CV chính dùng để apply
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Business Rules

    public void markAsPrimary() {
        this.primary = true;
    }

    public void unmarkPrimary() {
        this.primary = false;
    }

    public void updateTitle(String title) {
        if (title == null || title.isBlank())
            throw new IllegalArgumentException("CV title must not be blank");
        this.title = title.trim();
        this.updatedAt = LocalDateTime.now();
    }

    public void storeParsedContent(String content) {
        this.parsedContent = content;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isUploaded() {
        return type == CVType.UPLOADED;
    }

    public boolean isOnline() {
        return type == CVType.ONLINE;
    }
}