package edu.tlu.jobplatform.job.application.usecase.employer;

import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.Salary;
import edu.tlu.jobplatform.job.domain.model.vo.WorkLocation;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

// ── UpdateJobPostUseCase ──────────────────────────────────────────

@Slf4j
@Service
@RequiredArgsConstructor
class UpdateJobPostUseCase {

        private final JobPostRepository jobPostRepository;

        @Transactional
        public JobPost execute(UUID jobPostId, Command cmd) {

                JobPost job = jobPostRepository.findById(jobPostId)
                                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", jobPostId));

                if (!SecurityUtils.isOwnerOrAdmin(job.getPostedBy()))
                        throw new BusinessRuleException("Bạn không có quyền sửa bài đăng này.", "FORBIDDEN");

                job.updateContent(
                                cmd.title() != null ? cmd.title() : job.getTitle(),
                                cmd.slug() != null ? cmd.slug() : job.getSlug(),
                                cmd.description() != null ? cmd.description() : job.getDescription(),
                                cmd.requirements() != null ? cmd.requirements() : job.getRequirements(),
                                cmd.benefits() != null ? cmd.benefits() : job.getBenefits(),
                                cmd.jobType() != null ? cmd.jobType() : job.getJobType(),
                                cmd.level() != null ? cmd.level() : job.getLevel(),
                                cmd.category() != null ? cmd.category() : job.getCategory(),
                                cmd.salary() != null ? cmd.salary() : job.getSalary(),
                                cmd.workLocation() != null ? cmd.workLocation() : job.getWorkLocation(),
                                cmd.experienceYears() != null ? cmd.experienceYears() : job.getExperienceYears(),
                                cmd.vacancies() != null ? cmd.vacancies() : job.getVacancies(),
                                cmd.deadline() != null ? cmd.deadline() : job.getDeadline());

                return jobPostRepository.save(job);
        }

        public record Command(
                        String title, String slug, String description, String requirements,
                        String benefits, String jobType, String level, String category,
                        Salary salary, WorkLocation workLocation,
                        Integer experienceYears, Integer vacancies, LocalDate deadline) {
        }
}
