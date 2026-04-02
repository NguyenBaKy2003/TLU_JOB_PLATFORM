package edu.tlu.jobplatform.job.application.usecase.employer;

import edu.tlu.jobplatform.job.application.port.out.QuotaServicePort;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.domain.model.vo.Salary;
import edu.tlu.jobplatform.job.domain.model.vo.WorkLocation;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.job.domain.service.JobPostDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * UseCase: Employer tạo tin tuyển dụng mới (DRAFT).
 *
 * Flow:
 * 1. Kiểm tra company có subscription active không
 * 2. Validate nội dung cơ bản
 * 3. Tạo JobPost với status DRAFT
 * 4. KHÔNG tiêu quota — quota chỉ bị trừ khi PUBLISH
 *
 * Lý do tách Create và Publish:
 * Employer có thể tạo nhiều draft, chỉ trả tiền khi thực sự publish.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CreateJobPostUseCase {

    private final JobPostRepository jobPostRepository;
    private final JobPostDomainService domainService;
    private final QuotaServicePort quotaService;

    @Transactional
    public JobPost execute(Command cmd) {

        // 1. Kiểm tra có subscription không (chỉ warn, không block tạo draft)
        if (!quotaService.hasActiveSubscription(cmd.companyId())) {
            log.warn("Company {} tạo draft nhưng không có subscription active.", cmd.companyId());
        }

        // 2. Validate nội dung
        domainService.validateForCreate(cmd.title(), cmd.description(), cmd.deadline());

        // 3. Build salary
        Salary salary = cmd.salaryNegotiate()
                ? Salary.negotiate()
                : Salary.of(cmd.salaryMin(), cmd.salaryMax(), cmd.currency());

        // 4. Build work location
        WorkLocation workLocation = switch (cmd.workLocationType()) {
            case "REMOTE" -> WorkLocation.remote();
            case "HYBRID" -> WorkLocation.hybrid(cmd.city());
            default -> WorkLocation.onsite(cmd.city(), cmd.address());
        };

        // 5. Tạo JobPost (DRAFT)
        JobPost jobPost = JobPost.builder()
                .id(UUID.randomUUID())
                .companyId(cmd.companyId())
                .createdBy(cmd.createdBy())
                .title(cmd.title())
                .description(cmd.description())
                .requirements(cmd.requirements())
                .benefits(cmd.benefits())
                .categoryCode(cmd.categoryCode())
                .level(cmd.level())
                .jobType(cmd.jobType())
                .headcount(cmd.headcount() > 0 ? cmd.headcount() : 1)
                .salary(salary)
                .workLocation(workLocation)
                .deadline(cmd.deadline())
                .status(JobStatus.DRAFT)
                .featured(false)
                .viewCount(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        JobPost saved = jobPostRepository.save(jobPost);
        log.info("JobPost created (DRAFT): id={} company={}", saved.getId(), cmd.companyId());
        return saved;
    }

    public record Command(
            UUID companyId,
            UUID createdBy,
            String title,
            String description,
            String requirements,
            String benefits,
            String categoryCode,
            String level,
            String jobType,
            int headcount,
            // Salary
            boolean salaryNegotiate,
            BigDecimal salaryMin,
            BigDecimal salaryMax,
            String currency,
            // Location
            String workLocationType, // "ONSITE", "REMOTE", "HYBRID"
            String city,
            String address,
            // Deadline
            LocalDateTime deadline) {
    }
}