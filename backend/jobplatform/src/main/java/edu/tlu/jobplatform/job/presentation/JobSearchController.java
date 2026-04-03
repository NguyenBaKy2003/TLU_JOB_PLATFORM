package edu.tlu.jobplatform.job.presentation;

import edu.tlu.jobplatform.job.application.port.out.JobSearchPort;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.job.presentation.dto.response.JobPostDetailResponse;
import edu.tlu.jobplatform.job.presentation.dto.response.JobPostResponse;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Public search endpoints (không cần auth):
 * GET /api/v1/jobs — Danh sách bài đăng đang PUBLISHED
 * GET /api/v1/jobs/search — Tìm kiếm với filter
 * GET /api/v1/jobs/{id} — Chi tiết theo ID
 * GET /api/v1/jobs/slug/{slug} — Chi tiết theo slug (SEO-friendly)
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Job Search", description = "Tìm kiếm việc làm")
public class JobSearchController {

    private final JobSearchPort jobSearchPort;
    private final JobPostRepository jobPostRepository;

    @Operation(summary = "Danh sách việc làm đang tuyển")
    @GetMapping("/api/v1/jobs")
    public ResponseEntity<ApiResponse<PageResponse<JobPostResponse>>> listPublished(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());
        var result = jobPostRepository.findPublished(pageable).map(JobPostResponse::from);
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
        var result = jobSearchPort.search(keyword, city, category, jobType, level, companyId, pageable)
                .map(JobPostResponse::from);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @Operation(summary = "Chi tiết bài đăng theo ID (tăng view count)")
    @GetMapping("/api/v1/jobs/{id}")
    public ResponseEntity<ApiResponse<JobPostDetailResponse>> getById(@PathVariable UUID id) {
        JobPost job = jobPostRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", id));
        job.incrementView();
        jobPostRepository.save(job);
        return ResponseEntity.ok(ApiResponse.success(JobPostDetailResponse.from(job)));
    }

    @Operation(summary = "Chi tiết bài đăng theo slug")
    @GetMapping("/api/v1/jobs/slug/{slug}")
    public ResponseEntity<ApiResponse<JobPostDetailResponse>> getBySlug(@PathVariable String slug) {
        JobPost job = jobPostRepository.findBySlug(slug)
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", slug));
        job.incrementView();
        jobPostRepository.save(job);
        return ResponseEntity.ok(ApiResponse.success(JobPostDetailResponse.from(job)));
    }
}