package edu.tlu.jobplatform.job.presentation.dto.response;

import edu.tlu.jobplatform.shared.response.PageResponse;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class MySavedJobsResponse {
    private PageResponse<JobPostResponse> jobs;
    private Map<String, Long> categoryCounts;
    private long totalSaved;
}