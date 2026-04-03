package edu.tlu.jobplatform.job.domain.model;

import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.domain.model.vo.Salary;
import edu.tlu.jobplatform.job.domain.model.vo.WorkLocation;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Aggregate Root của Job domain.
 * Đây là bài đăng tuyển dụng — chứa toàn bộ thông tin JD.
 *
 * Vòng đời: DRAFT → PUBLISHED → (CLOSED | EXPIRED) → PUBLISHED (gia hạn)
 */
@Getter
@Builder
public class JobPost {

    private final UUID id;
    private final UUID companyId;
    private final UUID postedBy; // employerId

    // ── Nội dung JD ───────────────────────────────────────────
    private String title;
    private String slug;
    private String description;
    private String requirements;
    private String benefits;
    private String jobType; // FULL_TIME, PART_TIME, CONTRACT, INTERN
    private String level; // INTERN, JUNIOR, MIDDLE, SENIOR, LEAD, MANAGER
    private String category; // Ngành nghề

    // ── Điều kiện ─────────────────────────────────────────────
    private Salary salary;
    private WorkLocation workLocation;
    private Integer experienceYears;
    private Integer vacancies; // Số lượng tuyển

    // ── Thời hạn ──────────────────────────────────────────────
    private LocalDate deadline; // Hạn nộp CV
    private LocalDateTime publishedAt;
    private LocalDateTime closedAt;
    private LocalDateTime expiredAt;

    // ── Trạng thái ────────────────────────────────────────────
    private JobStatus status;
    private int viewCount;
    private int applicationCount;

    // ── Skills ────────────────────────────────────────────────
    @Builder.Default
    private List<JobPostSkill> skills = new ArrayList<>();

    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Business Methods ──────────────────────────────────────

    /**
     * Publish bài đăng — chuyển từ DRAFT/CLOSED/EXPIRED → PUBLISHED.
     * Quota đã được kiểm tra và trừ trước khi gọi method này.
     */
    public void publish() {
        status.assertCanTransitionTo(JobStatus.PUBLISHED);
        this.status = JobStatus.PUBLISHED;
        this.publishedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /** Đóng bài đăng thủ công */
    public void close() {
        status.assertCanTransitionTo(JobStatus.CLOSED);
        this.status = JobStatus.CLOSED;
        this.closedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /** Hệ thống tự động đánh dấu hết hạn */
    public void markExpired() {
        status.assertCanTransitionTo(JobStatus.EXPIRED);
        this.status = JobStatus.EXPIRED;
        this.expiredAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /** Soft delete */
    public void delete() {
        status.assertCanTransitionTo(JobStatus.DELETED);
        this.status = JobStatus.DELETED;
        this.updatedAt = LocalDateTime.now();
    }

    /** Cập nhật nội dung — chỉ khi đang DRAFT/CLOSED/EXPIRED */
    public void updateContent(String title, String slug, String description,
            String requirements, String benefits,
            String jobType, String level, String category,
            Salary salary, WorkLocation workLocation,
            Integer experienceYears, Integer vacancies,
            LocalDate deadline) {
        if (!status.isEditable())
            throw new BusinessRuleException(
                    "Chỉ có thể sửa bài đăng ở trạng thái DRAFT, CLOSED hoặc EXPIRED.",
                    "JOB_NOT_EDITABLE");

        this.title = title;
        this.slug = slug;
        this.description = description;
        this.requirements = requirements;
        this.benefits = benefits;
        this.jobType = jobType;
        this.level = level;
        this.category = category;
        this.salary = salary;
        this.workLocation = workLocation;
        this.experienceYears = experienceYears;
        this.vacancies = vacancies;
        this.deadline = deadline;
        this.updatedAt = LocalDateTime.now();
    }

    /** Tăng view count */
    public void incrementView() {
        this.viewCount++;
    }

    /** Tăng application count khi có CV mới */
    public void incrementApplications() {
        this.applicationCount++;
    }

    /** Kiểm tra bài đăng có thể nhận CV không */
    public boolean isAcceptingApplications() {
        return status == JobStatus.PUBLISHED
                && (deadline == null || !LocalDate.now().isAfter(deadline));
    }

    /** Full text để AI tạo embedding */
    public String toFullText() {
        return String.join("\n\n",
                "Vị trí: " + title,
                "Mô tả: " + (description != null ? description : ""),
                "Yêu cầu: " + (requirements != null ? requirements : ""),
                "Quyền lợi: " + (benefits != null ? benefits : ""));
    }
}