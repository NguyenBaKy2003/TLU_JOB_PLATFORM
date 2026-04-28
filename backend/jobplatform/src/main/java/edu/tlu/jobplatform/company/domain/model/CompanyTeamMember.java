package edu.tlu.jobplatform.company.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Thành viên đội ngũ công ty — hiển thị trên trang giới thiệu.
 */
@Getter
@Builder
public class CompanyTeamMember {

    private final UUID id;
    private final UUID companyId;

    private String fullName;
    private String jobTitle;
    private String bio;
    private String avatarUrl;
    private String linkedinUrl;
    private int displayOrder;
    private boolean visible;

    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Business Rules ────────────────────────────────────────

    public void update(String fullName, String jobTitle, String bio,
            String linkedinUrl, int displayOrder) {
        this.fullName = fullName;
        this.jobTitle = jobTitle;
        this.bio = bio;
        this.linkedinUrl = linkedinUrl;
        this.displayOrder = displayOrder;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateAvatar(String avatarUrl) {
        this.avatarUrl = avatarUrl;
        this.updatedAt = LocalDateTime.now();
    }

    public void hide() {
        this.visible = false;
        this.updatedAt = LocalDateTime.now();
    }

    public void show() {
        this.visible = true;
        this.updatedAt = LocalDateTime.now();
    }
}