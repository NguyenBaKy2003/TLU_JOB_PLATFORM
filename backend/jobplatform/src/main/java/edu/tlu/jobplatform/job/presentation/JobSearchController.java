package edu.tlu.jobplatform.job.presentation;

import edu.tlu.jobplatform.ai.application.usecase.TrackCandidateBehaviorUseCase;
import edu.tlu.jobplatform.job.application.usecase.candidate.GetJobDetailUseCase;
import edu.tlu.jobplatform.job.application.usecase.candidate.SearchJobsUseCase;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.job.presentation.dto.response.JobPostDetailResponse;
import edu.tlu.jobplatform.job.presentation.dto.response.JobPostResponse;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Job Search", description = "Tìm kiếm việc làm")
public class JobSearchController {

    private final GetJobDetailUseCase getJobDetailUseCase;
    private final SearchJobsUseCase searchJobsUseCase;
    private final JobPostRepository jobPostRepository;
    private final TrackCandidateBehaviorUseCase trackUseCase;

    @Operation(summary = "Danh sách việc làm đang tuyển")
    @GetMapping("/api/v1/jobs")
    public ResponseEntity<ApiResponse<PageResponse<JobPostResponse>>> listPublished(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());
        var result = jobPostRepository.findPublished(pageable)
                .map(JobPostResponse::from);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @Operation(summary = "Tìm kiếm việc làm")
    @GetMapping("/api/v1/jobs/search")
    public ResponseEntity<ApiResponse<PageResponse<JobPostResponse>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) UUID companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());
        var query = new SearchJobsUseCase.SearchQuery(keyword, city, category, jobType, level, companyId);
        var result = searchJobsUseCase.execute(query, pageable)
                .map(JobPostResponse::from);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @Operation(summary = "Chi tiết bài đăng theo ID")
    @GetMapping("/api/v1/jobs/{id}")
    public ResponseEntity<ApiResponse<JobPostDetailResponse>> getById(@PathVariable UUID id) {

        SecurityUtils.getCurrentUserId().ifPresent(userId -> trackUseCase.trackJobView(userId, id, 10)); // dwell mặc
                                                                                                         // định 10s

        return ResponseEntity.ok(ApiResponse.success(
                JobPostDetailResponse.from(getJobDetailUseCase.executeById(id))));
    }

    @Operation(summary = "Chi tiết bài đăng theo slug")
    @GetMapping("/api/v1/jobs/slug/{slug}")
    public ResponseEntity<ApiResponse<JobPostDetailResponse>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(
                JobPostDetailResponse.from(getJobDetailUseCase.executeBySlug(slug))));
    }
}