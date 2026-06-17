package edu.tlu.jobplatform.admin.application.usecase;

import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminDashboardUseCase {

        private final UserRepository userRepo;
        private final CompanyRepository companyRepo;
        private final JobPostRepository jobPostRepo;
        private final ApplicationRepository applicationRepo;

        @Transactional(readOnly = true)
        public DashboardStats execute() {
                long totalUsers = userRepo.countAll();
                long totalCompanies = companyRepo.countAll();
                long pendingCompanies = companyRepo.countByVerificationStatus(VerificationStatus.UNVERIFIED);
                long activeJobs = jobPostRepo.findByStatus(JobStatus.PUBLISHED,
                                PageRequest.of(0, 1)).getTotalElements();
                long totalJobs = jobPostRepo.findByStatus(JobStatus.DRAFT,
                                PageRequest.of(0, 1)).getTotalElements()
                                + activeJobs;
                long totalApplications = applicationRepo.findByCompanyId(
                                null, PageRequest.of(0, 1)).getTotalElements();

                return new DashboardStats(
                                totalUsers, totalCompanies, pendingCompanies,
                                activeJobs, totalJobs, totalApplications);
        }

        public record DashboardStats(
                        long totalUsers,
                        long totalCompanies,
                        long pendingCompanies,
                        long activeJobs,
                        long totalJobs,
                        long totalApplications) {
        }
}
