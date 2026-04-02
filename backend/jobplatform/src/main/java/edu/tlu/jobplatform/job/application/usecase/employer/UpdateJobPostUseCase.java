package edu.tlu.jobplatform.job.application.usecase.employer;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.JobPostSkill;
import edu.tlu.jobplatform.job.domain.model.vo.Salary;
import edu.tlu.jobplatform.job.domain.model.vo.WorkLocation;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * UseCase: Employer cập nhật tin tuyển dụng.
 *
 * Chỉ update được khi status là DRAFT, CLOSED hoặc EXPIRED.
 * PUBLISHED → phải close trước rồi mới update.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateJobPostUseCase {

    private final JobPostRepository jobPostRepository;

    @Transactional
    public JobPost execute(UUID jobPostId, UUID companyId, Command cmd) {

        JobPost job = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", jobPostId));

        if (!job.isOwnedBy(companyId))
            throw new BusinessRuleException("Bạn không có quyền chỉnh sửa tin này.", "FORBIDDEN");

        // Build salary
        Salary salary = cmd.salaryNegotiate()
                ? Salary.negotiate()
                : Salary.of(cmd.salaryMin(), cmd.salaryMax(), cmd.currency());

        // Build work location
        WorkLocation workLocation = switch (cmd.workLocationType()) {
            case "REMOTE" -> WorkLocation.remote();
            case "HYBRID" -> WorkLocation.hybrid(cmd.city());
            default -> WorkLocation.onsite(cmd.city(), cmd.address());
        };

        // Update aggregate (domain validates isEditable internally)
        job.update(cmd.title(), cmd.description(), cmd.requirements(), cmd.benefits(),
                cmd.categoryCode(), cmd.level(), cmd.jobType(), cmd.headcount(),
                salary, workLocation, cmd.deadline());

        // Update skills nếu được truyền vào
        if (cmd.skills() != null) {
            List<JobPostSkill> skills = cmd.skills().stream()
                    .map(s -> JobPostSkill.builder()
                            .id(UUID.randomUUID())
                            .jobPostId(jobPostId)
                            .skillName(s.skillName())
                            .required(s.required())
                            .yearsRequired(s.yearsRequired())
                            .build())
                    .toList();
            job.updateSkills(skills);
        }

        JobPost saved = jobPostRepository.save(job);
        log.info("JobPost updated: id={}", jobPostId);
        return saved;
    }

    public record Command(
            String title,
            String description,
            String requirements,
            String benefits,
            String categoryCode,
            String level,
            String jobType,
            int headcount,
            boolean salaryNegotiate,
            BigDecimal salaryMin,
            BigDecimal salaryMax,
            String currency,
            String workLocationType,
            String city,
            String address,
            LocalDateTime deadline,
            List<SkillCommand> skills) {
    }

    public record SkillCommand(String skillName, boolean required, int yearsRequired) {
    }
}