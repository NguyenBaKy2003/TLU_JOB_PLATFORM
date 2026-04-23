package edu.tlu.jobplatform.cv.domain.model;

import edu.tlu.jobplatform.cv.domain.model.vo.CVStatus;
import edu.tlu.jobplatform.cv.domain.model.vo.CVVisibility;
import edu.tlu.jobplatform.cv.domain.model.vo.PersonalInfo;
import edu.tlu.jobplatform.cv.domain.model.vo.SectionType;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Aggregate Root của domain CV.
 *
 * Mọi thay đổi với CVSection đều phải đi qua OnlineCV,
 * không bao giờ modify CVSection trực tiếp từ bên ngoài.
 *
 * Invariants:
 * - Phải có ít nhất 1 section VISIBLE để publish
 * - PersonalInfo phải đủ fullName + email mới publish được
 * - ARCHIVED CV không thể chỉnh sửa (phải restore trước)
 */
@Getter
@Builder
public class OnlineCV {

    private final UUID id;
    private final UUID candidateId;
    private String title;
    private UUID templateId;
    private PersonalInfo personalInfo;

    @Builder.Default
    private List<CVSection> sections = new ArrayList<>();

    private CVStatus status;
    private CVVisibility visibility;
    private String slug; // unique URL-friendly identifier
    private long viewCount;
    private String exportedPdfUrl; // URL PDF đã render gần nhất

    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Metadata update ───────────────────────────────────────────────────────

    public void updateMetadata(String title, PersonalInfo personalInfo,
            UUID templateId, CVVisibility visibility) {
        guardNotArchived();
        this.title = title;
        this.personalInfo = personalInfo;
        this.templateId = templateId;
        this.visibility = visibility;
        this.updatedAt = LocalDateTime.now();
    }

    // ── Section management ────────────────────────────────────────────────────

    /** Thêm section mới vào cuối */
    public CVSection addSection(SectionType type, String title, String content) {
        guardNotArchived();
        int order = sections.size();
        CVSection section = CVSection.builder()
                .id(UUID.randomUUID())
                .cvId(this.id)
                .type(type)
                .title(title)
                .content(content)
                .displayOrder(order)
                .visible(true)
                .build();
        sections.add(section);
        this.updatedAt = LocalDateTime.now();
        return section;
    }

    /** Cập nhật nội dung section đã có */
    public void updateSection(UUID sectionId, String title, String content, boolean visible) {
        guardNotArchived();
        CVSection section = findSectionOrThrow(sectionId);
        section.updateContent(title, content);
        section.setVisible(visible);
        this.updatedAt = LocalDateTime.now();
    }

    /** Xóa section */
    public void removeSection(UUID sectionId) {
        guardNotArchived();
        boolean removed = sections.removeIf(s -> s.getId().equals(sectionId));
        if (!removed) {
            throw new BusinessRuleException(
                    "Section không tồn tại: " + sectionId, "SECTION_NOT_FOUND");
        }
        reindexSections();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Sắp xếp lại sections theo thứ tự sectionIds truyền vào.
     * sectionIds phải chứa đủ tất cả section IDs hiện có.
     */
    public void reorderSections(List<UUID> sectionIds) {
        guardNotArchived();
        if (sectionIds.size() != sections.size()) {
            throw new BusinessRuleException(
                    "Danh sách section không khớp với CV hiện tại.", "SECTION_ORDER_MISMATCH");
        }
        Map<UUID, CVSection> sectionMap = sections.stream()
                .collect(Collectors.toMap(CVSection::getId, s -> s));
        for (int i = 0; i < sectionIds.size(); i++) {
            CVSection s = sectionMap.get(sectionIds.get(i));
            if (s == null) {
                throw new BusinessRuleException(
                        "Section không tồn tại: " + sectionIds.get(i), "SECTION_NOT_FOUND");
            }
            s.reorder(i);
        }
        sections.sort(Comparator.comparingInt(CVSection::getDisplayOrder));
        this.updatedAt = LocalDateTime.now();
    }

    // ── Status transitions ────────────────────────────────────────────────────

    /** DRAFT → PUBLISHED. Validate trước khi publish. */
    public void publish(String slug) {
        if (status == CVStatus.ARCHIVED) {
            throw new BusinessRuleException(
                    "CV đã bị archive. Vui lòng restore trước khi publish.", "CV_ARCHIVED");
        }
        if (personalInfo == null || !personalInfo.isCompleteEnoughToPublish()) {
            throw new BusinessRuleException(
                    "CV cần có họ tên và email trước khi publish.", "CV_INCOMPLETE");
        }
        boolean hasVisibleSection = sections.stream().anyMatch(CVSection::isVisible);
        if (!hasVisibleSection) {
            throw new BusinessRuleException(
                    "CV cần có ít nhất 1 section hiển thị trước khi publish.", "CV_NO_VISIBLE_SECTION");
        }
        this.status = CVStatus.PUBLISHED;
        this.slug = slug;
        this.updatedAt = LocalDateTime.now();
    }

    /** → ARCHIVED */
    public void archive() {
        this.status = CVStatus.ARCHIVED;
        this.updatedAt = LocalDateTime.now();
    }

    /** ARCHIVED → DRAFT */
    public void restore() {
        if (status != CVStatus.ARCHIVED) {
            throw new BusinessRuleException(
                    "Chỉ có thể restore CV đang ở trạng thái ARCHIVED.", "CV_NOT_ARCHIVED");
        }
        this.status = CVStatus.DRAFT;
        this.updatedAt = LocalDateTime.now();
    }

    // ── Stats & PDF ───────────────────────────────────────────────────────────

    public void incrementViewCount() {
        this.viewCount++;
    }

    public void updateExportedPdfUrl(String pdfUrl) {
        this.exportedPdfUrl = pdfUrl;
        this.updatedAt = LocalDateTime.now();
    }

    // ── Read-only view ────────────────────────────────────────────────────────

    public List<CVSection> getSections() {
        return Collections.unmodifiableList(sections);
    }

    public List<CVSection> getVisibleSections() {
        return sections.stream()
                .filter(CVSection::isVisible)
                .sorted(Comparator.comparingInt(CVSection::getDisplayOrder))
                .toList();
    }

    public boolean isPublic() {
        return status == CVStatus.PUBLISHED
                && (visibility == CVVisibility.PUBLIC || visibility == CVVisibility.LINK_ONLY);
    }

    public boolean isOwnedBy(UUID userId) {
        return candidateId.equals(userId);
    }

    // ── Helpers

    private void guardNotArchived() {
        if (status == CVStatus.ARCHIVED) {
            throw new BusinessRuleException(
                    "CV đã bị archive. Không thể chỉnh sửa.", "CV_ARCHIVED");
        }
    }

    private CVSection findSectionOrThrow(UUID sectionId) {
        return sections.stream()
                .filter(s -> s.getId().equals(sectionId))
                .findFirst()
                .orElseThrow(() -> new BusinessRuleException(
                        "Section không tồn tại: " + sectionId, "SECTION_NOT_FOUND"));
    }

    private void reindexSections() {
        for (int i = 0; i < sections.size(); i++) {
            sections.get(i).reorder(i);
        }
    }
}