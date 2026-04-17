package edu.tlu.jobplatform.application.domain.service;

import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationResponse.JobInfo;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobPostInfoResolver {

    private final JobPostRepository jobPostRepository;

    public Map<UUID, JobInfo> resolveAll(Collection<UUID> jobPostIds) {
        return jobPostRepository.findAllById(jobPostIds).stream()
                .collect(Collectors.toMap(
                        JobPost::getId,
                        this::toJobInfo));
    }

    private JobInfo toJobInfo(JobPost j) {
        return JobInfo.of(
                j.getId(),
                j.getTitle(),
                j.getSlug(),
                j.getJobType(),
                j.getLevel(),
                j.getWorkLocation() != null ? j.getWorkLocation().getCity() : null,
                j.getDeadline() != null ? j.getDeadline().toString() : null,
                j.getSalary() != null ? j.getSalary().display() : "Thoả thuận");
    }
}