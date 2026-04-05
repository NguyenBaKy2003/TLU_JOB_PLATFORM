package edu.tlu.jobplatform.job.application.usecase.employer;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.JobPostSkill;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.domain.model.vo.Salary;
import edu.tlu.jobplatform.job.domain.model.vo.WorkLocation;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * UseCase: Tạo bài đăng tuyển dụng (DRAFT).
 *
 * Tạo bài ở trạng thái DRAFT trước — employer chỉnh sửa rồi mới publish.
 * Quota chưa bị trừ ở bước này — chỉ trừ khi publish.
 *
 * BR-01: Công ty phải có subscription active (kiểm tra ở PublishJobPost)
 * BR-02: Tiêu đề phải có
 * BR-03: Slug tự động sinh từ tiêu đề
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CreateJobPostUseCase {

    private final JobPostRepository jobPostRepository;

    @Transactional
    public JobPost execute(Command cmd) {

        if (cmd.title() == null || cmd.title().isBlank())
            throw new BusinessRuleException("Tiêu đề bài đăng không được để trống.", "JOB_TITLE_REQUIRED");

        String slug = generateUniqueSlug(cmd.title());

        // Gán jobPostId cho từng skill trước khi lưu
        UUID jobId = UUID.randomUUID();
        List<JobPostSkill> skills = new ArrayList<>();
        if (cmd.skills() != null) {
            for (JobPostSkill s : cmd.skills()) {
                skills.add(JobPostSkill.builder()
                        .id(UUID.randomUUID())
                        .jobPostId(jobId)
                        .skillName(s.getSkillName())
                        .level(s.getLevel())
                        .required(s.isRequired())
                        .build());
            }
        }

        JobPost job = JobPost.builder()
                .id(jobId)
                .companyId(cmd.companyId())
                .postedBy(cmd.postedBy())
                .title(cmd.title().trim())
                .slug(slug)
                .description(cmd.description())
                .requirements(cmd.requirements())
                .benefits(cmd.benefits())
                .jobType(cmd.jobType())
                .level(cmd.level())
                .category(cmd.category())
                .salary(cmd.salary())
                .workLocation(cmd.workLocation())
                .experienceYears(cmd.experienceYears())
                .vacancies(cmd.vacancies() != null ? cmd.vacancies() : 1)
                .deadline(cmd.deadline())
                .skills(skills)
                .status(JobStatus.DRAFT)
                .viewCount(0)
                .applicationCount(0)
                .createdAt(LocalDateTime.now())
                .build();

        JobPost saved = jobPostRepository.save(job);
        log.info("JobPost created (DRAFT): {} [company={}]", saved.getId(), cmd.companyId());
        return saved;
    }

    private String generateUniqueSlug(String title) {
        String base = SlugUtils.slugify(title);
        String slug = base;
        int suffix = 1;
        while (jobPostRepository.existsBySlug(slug))
            slug = base + "-" + suffix++;
        return slug;
    }

    public record Command(
            UUID companyId,
            UUID postedBy,
            String title,
            String description,
            String requirements,
            String benefits,
            String jobType,
            String level,
            String category,
            Salary salary,
            WorkLocation workLocation,
            Integer experienceYears,
            Integer vacancies,
            LocalDate deadline,
            List<JobPostSkill> skills // nullable — có thể không có skill khi tạo DRAFT
    ) {
    }
}