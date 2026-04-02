package edu.tlu.jobplatform.job.presentation.dto.response;

import edu.tlu.jobplatform.job.application.port.out.JobSearchPort.SearchResult;

import java.util.List;

// ── JobSearchResponse (paginated) ─────────────────────────────

public record JobSearchResponse(
                List<JobPostResponse> items,
                long totalElements,
                int totalPages,
                int currentPage,
                int pageSize) {
        public static JobSearchResponse from(SearchResult result) {
                List<JobPostResponse> items = result.items().stream()
                                .map(JobPostResponse::from)
                                .toList();

                return new JobSearchResponse(
                                items,
                                result.totalElements(),
                                result.totalPages(),
                                result.currentPage(),
                                items.size());
        }
}