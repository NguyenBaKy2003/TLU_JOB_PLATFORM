package edu.tlu.jobplatform.application.usecase.employer;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationDetailResponse.CandidateInfo;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationResponse.JobInfo;
import edu.tlu.jobplatform.application.presentation.dto.response.InterviewScheduleResponse;
import edu.tlu.jobplatform.application.domain.service.CandidateInfoResolver;
import edu.tlu.jobplatform.application.domain.service.JobPostInfoResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetInterviewScheduleUseCase {

    private final ApplicationRepository applicationRepo;
    private final CandidateInfoResolver candidateInfoResolver;
    private final JobPostInfoResolver jobPostInfoResolver;

    /**
     * @param companyId công ty đang đăng nhập
     * @param from      lọc từ ngày (null = không giới hạn)
     * @param to        lọc đến ngày (null = không giới hạn)
     * @param pageable  phân trang
     */
    public Page<InterviewScheduleResponse> execute(
            UUID companyId,
            LocalDateTime from,
            LocalDateTime to,
            Pageable pageable) {

        Page<Application> appPage = applicationRepo
                .findInterviewScheduledByCompanyId(companyId, from, to, pageable);

        Set<UUID> candidateIds = appPage.stream()
                .map(Application::getCandidateId)
                .collect(Collectors.toSet());

        Set<UUID> jobPostIds = appPage.stream()
                .map(Application::getJobPostId)
                .collect(Collectors.toSet());

        Map<UUID, CandidateInfo> candidateMap = candidateInfoResolver.resolveAll(candidateIds);
        Map<UUID, JobInfo> jobMap = jobPostInfoResolver.resolveAll(jobPostIds);

        return appPage.map(app -> InterviewScheduleResponse.from(
                app,
                candidateMap.get(app.getCandidateId()),
                jobMap.containsKey(app.getJobPostId())
                        ? jobMap.get(app.getJobPostId()).getTitle()
                        : null));
    }
}