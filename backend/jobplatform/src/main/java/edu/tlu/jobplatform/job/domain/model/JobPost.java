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

@Getter
@Builder
public class JobPost {

    private final UUID id;
    private final UUID companyId;
    private final UUID postedBy;

    private String title;
    private String slug;
    private String description;
    private String requirements;
    private String benefits;
    private String jobType;
    private String level;
    private String category;

    private Salary salary;
    private WorkLocation workLocation;
    private Integer experienceYears;
    private Integer vacancies;

    private LocalDate deadline;
    private LocalDateTime publishedAt;
    private LocalDateTime closedAt;
    private LocalDateTime expiredAt;

    private JobStatus status;
    private boolean featured; // ← MỚI
    private int viewCount;
    private int applicationCount;

    @Builder.Default
    private List<JobPostSkill> skills = new ArrayList<>();

    private final LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Business Methods ──────────────────────────────────────

    public void publish() {
        status.assertCanTransitionTo(JobStatus.PUBLISHED);
        this.status = JobStatus.PUBLISHED;
        this.publishedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void close() {
        status.assertCanTransitionTo(JobStatus.CLOSED);
        this.status = JobStatus.CLOSED;
        this.closedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void markExpired() {
        status.assertCanTransitionTo(JobStatus.EXPIRED);
        this.status = JobStatus.EXPIRED;
        this.expiredAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void delete() {
        status.assertCanTransitionTo(JobStatus.DELETED);
        this.status = JobStatus.DELETED;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Đánh dấu bài đăng là nổi bật.
     * Chỉ gọi sau khi consumeFeaturedQuota thành công.
     */
    public void markFeatured() {
        this.featured = true;
        this.updatedAt = LocalDateTime.now();
    }

    public void updateContent(String title, String slug, String description,
            String requirements, String benefits,
            String jobType, String level, String category,
            Salary salary, WorkLocation workLocation,
            Integer experienceYears, Integer vacancies,
            LocalDate deadline, List<JobPostSkill> skills) {

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
        if (skills != null)
            this.skills = new ArrayList<>(skills);
        this.updatedAt = LocalDateTime.now();
    }

    public void incrementView() {
        this.viewCount++;
    }

    public void incrementApplications() {
        this.applicationCount++;
    }

    public boolean isAcceptingApplications() {
        return status == JobStatus.PUBLISHED
                && (deadline == null || !LocalDate.now().isAfter(deadline));
    }

    public String toFullText() {
        return String.join("\n\n",
                "Vị trí: " + title,
                "Mô tả: " + (description != null ? description : ""),
                "Yêu cầu: " + (requirements != null ? requirements : ""),
                "Quyền lợi: " + (benefits != null ? benefits : ""));
    }

    public void transitionTo(JobStatus target) {
        this.status.assertCanTransitionTo(target);
        this.status = target;
    }
}