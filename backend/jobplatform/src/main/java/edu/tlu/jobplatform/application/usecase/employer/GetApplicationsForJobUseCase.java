package edu.tlu.jobplatform.application.usecase.employer;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetApplicationsForJobUseCase {

    private final ApplicationRepository applicationRepo;

    @Transactional(readOnly = true)
    public Page<Application> execute(UUID jobPostId, ApplicationStatus status, Pageable pageable) {
        if (status != null)
            return applicationRepo.findByJobPostIdAndStatusOrderByBoostFirst(jobPostId, status, pageable);
        return applicationRepo.findByJobPostIdOrderByBoostFirst(jobPostId, pageable);
    }
}