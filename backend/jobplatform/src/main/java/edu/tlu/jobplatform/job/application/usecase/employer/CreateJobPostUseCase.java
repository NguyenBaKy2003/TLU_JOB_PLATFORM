package edu.tlu.jobplatform.job.application.usecase.employer;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.JobPostSkill;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.domain.model.vo.Salary;
import edu.tlu.jobplatform.job.domain.model.vo.WorkLocation;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class CreateJobPostUseCase {

    private final JobPostRepository jobPostRepository;
    private final CompanyRepository companyRepository;
    // CheckQuotaUseCase đã bỏ — quota chỉ trừ khi publish

    @Transactional
    public JobPost execute(Command cmd) {

        CompanyProfile company = companyRepository.findById(cmd.companyId())
                .orElseThrow(() -> ResourceNotFoundException.of("Company", cmd.companyId()));

        if (cmd.title() == null || cmd.title().isBlank())
            throw new BusinessRuleException(
                    "Tiêu đề bài đăng không được để trống.", "JOB_TITLE_REQUIRED");

        if (company.getVerificationStatus() != VerificationStatus.VERIFIED)
            throw new BusinessRuleException(
                    "Công ty chưa được xác thực. Không thể đăng tin tuyển dụng.",
                    "COMPANY_NOT_VERIFIED");

        String slug = generateUniqueSlug(cmd.title());
        UUID jobId = UUID.randomUUID();

        List<JobPostSkill> skills = new ArrayList<>();
        if (cmd.skills() != null) {
            for (JobPostSkill s : cmd.skills()) {
                skills.add(JobPostSkill.builder()
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
                .featured(false) // ← luôn false khi tạo DRAFT
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
            List<JobPostSkill> skills) {
    }
}