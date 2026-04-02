package edu.tlu.jobplatform.job.domain.model;

import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.domain.model.vo.Salary;
import edu.tlu.jobplatform.job.domain.model.vo.WorkLocation;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Aggregate Root: Tin tuyển dụng.
 *
 * Vòng đời: DRAFT → PUBLISHED → CLOSED/EXPIRED → (có thể re-publish)
 *
 * Invariants:
 * - Chỉ PUBLISHED mới hiển thị cho ứng viên
 * - Publish phải có đủ thông tin bắt buộc (title, description, deadline)
 * - Deadline phải sau ngày publish
 * - Chỉ employer sở hữu mới được thay đổi
 */
@Getter
@Builder
public class JobPost {

    private final UUID id;
    private final UUID companyId; // employer sở hữu
    private final UUID createdBy; // user tạo (HR account)

    // ── Thông tin cơ bản ──────────────────────────────────────
    private String title;
    private String description; // HTML/Markdown
    private String requirements; // Yêu cầu ứng viên
    private String benefits; // Quyền lợi
    private String categoryCode; // "IT", "MARKETING", "FINANCE"...
    private String level; // "INTERN", "JUNIOR", "SENIOR", "MANAGER"
    private String jobType; // "FULL_TIME", "PART_TIME", "CONTRACT", "FREELANCE"
    private int headcount; // Số lượng tuyển

    // ── Value Objects ─────────────────────────────────────────
    private Salary salary;
    private WorkLocation workLocation;

    // ── Thời hạn ─────────────────────────────────────────────
    private LocalDateTime deadline; // Hết hạn nộp hồ sơ
    private LocalDateTime publishedAt;
    private LocalDateTime closedAt;

    // ── Trạng thái ───────────────────────────────────────────
    private JobStatus status;
    private boolean featured; // Tin nổi bật (tiêu tốn featured quota)

    // ── Skills ───────────────────────────────────────────────
    @Builder.Default
    private List<JobPostSkill> skills = new ArrayList<>();

    // ── Metadata ─────────────────────────────────────────────
    private int viewCount;
    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Business Rules ────────────────────────────────────────

    public boolean isOwnedBy(UUID companyId) {
        return this.companyId.equals(companyId);
    }

    public boolean isPublished() {
        return status == JobStatus.PUBLISHED;
    }

    public boolean isActive() {
        return status == JobStatus.PUBLISHED
                && deadline != null
                && LocalDateTime.now().isBefore(deadline);
    }

    public boolean isEditable() {
        return status.isEditable();
    }

    // ── State Transitions ─────────────────────────────────────

    /**
     * Chuyển sang PUBLISHED.
     * Validate đủ điều kiện trước khi gọi.
     */
    public void publish() {
        status.validateTransitionTo(JobStatus.PUBLISHED);
        this.status = JobStatus.PUBLISHED;
        this.publishedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void close() {
        status.validateTransitionTo(JobStatus.CLOSED);
        this.status = JobStatus.CLOSED;
        this.closedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void expire() {
        status.validateTransitionTo(JobStatus.EXPIRED);
        this.status = JobStatus.EXPIRED;
        this.updatedAt = LocalDateTime.now();
    }

    public void delete() {
        status.validateTransitionTo(JobStatus.DELETED);
        this.status = JobStatus.DELETED;
        this.updatedAt = LocalDateTime.now();
    }

    public void markFeatured() {
        this.featured = true;
        this.updatedAt = LocalDateTime.now();
    }

    // ── Update ────────────────────────────────────────────────

    public void update(String title, String description, String requirements, String benefits,
            String categoryCode, String level, String jobType, int headcount,
            Salary salary, WorkLocation workLocation, LocalDateTime deadline) {
        if (!isEditable())
            throw new BusinessRuleException(
                    "Chỉ có thể chỉnh sửa tin ở trạng thái DRAFT, CLOSED hoặc EXPIRED.",
                    "JOB_NOT_EDITABLE");

        this.title = title;
        this.description = description;
        this.requirements = requirements;
        this.benefits = benefits;
        this.categoryCode = categoryCode;
        this.level = level;
        this.jobType = jobType;
        this.headcount = headcount;
        this.salary = salary;
        this.workLocation = workLocation;
        this.deadline = deadline;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateSkills(List<JobPostSkill> newSkills) {
        this.skills = new ArrayList<>(newSkills);
        this.updatedAt = LocalDateTime.now();
    }

    public void incrementViewCount() {
        this.viewCount++;
    }

    public List<JobPostSkill> getSkills() {
        return Collections.unmodifiableList(skills);
    }
}