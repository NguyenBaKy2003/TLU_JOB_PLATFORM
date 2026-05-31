package edu.tlu.jobplatform.job.presentation;

import edu.tlu.jobplatform.ai.application.usecase.TrackCandidateBehaviorUseCase;
import edu.tlu.jobplatform.job.application.usecase.candidate.GetJobDetailUseCase;
import edu.tlu.jobplatform.job.application.usecase.candidate.SearchJobsUseCase;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.job.presentation.dto.response.JobPostDetailResponse;
import edu.tlu.jobplatform.job.presentation.dto.response.JobPostResponse;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
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
        @RateLimit(policy = "public-read", scope = RateLimitPolicy.Scope.IP)
        public ResponseEntity<ApiResponse<PageResponse<JobPostResponse>>> listPublished(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "12") int size) {

                // JPQL — Sort camelCase hoạt động bình thường
                var pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());
                var result = jobPostRepository.findPublished(pageable)
                                .map(JobPostResponse::from);
                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Tìm kiếm việc làm")
        @GetMapping("/api/v1/jobs/search")
        @RateLimit(policy = "public-read", scope = RateLimitPolicy.Scope.IP)
        public ResponseEntity<ApiResponse<PageResponse<JobPostResponse>>> search(
                        @RequestParam(required = false) String keyword,
                        @RequestParam(required = false) String city,
                        @RequestParam(required = false) String category,
                        @RequestParam(required = false) UUID companyId,
                        @RequestParam(required = false) String workLocType,
                        @RequestParam(required = false) String currency,
                        @RequestParam(required = false) BigDecimal minSalary,
                        @RequestParam(required = false) BigDecimal maxSalary,
                        @RequestParam(required = false) Integer postedWithinDays,
                        @RequestParam(required = false) List<String> jobTypes,
                        @RequestParam(required = false) List<String> levels,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "12") int size) {

                LocalDateTime postedAfter = (postedWithinDays != null)
                                ? LocalDateTime.now().minusDays(postedWithinDays)
                                : null;

                // Native query — ORDER BY đã hardcode trong SQL, không truyền Sort
                var pageable = PageRequest.of(page, size);
                var query = new SearchJobsUseCase.SearchQuery(
                                keyword, city, category, companyId,
                                workLocType, currency,
                                minSalary, maxSalary,
                                postedAfter,
                                jobTypes, levels);

                var result = searchJobsUseCase.execute(query, pageable).map(JobPostResponse::from);
                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Chi tiết bài đăng theo ID")
        @GetMapping("/api/v1/jobs/{id}")
        @RateLimit(policy = "public-read", scope = RateLimitPolicy.Scope.IP)
        public ResponseEntity<ApiResponse<JobPostDetailResponse>> getById(@PathVariable UUID id) {

                SecurityUtils.getCurrentUserId()
                                .ifPresent(userId -> trackUseCase.trackJobView(userId, id, 10));

                return ResponseEntity.ok(ApiResponse.success(
                                JobPostDetailResponse.from(getJobDetailUseCase.executeById(id))));
        }

        @Operation(summary = "Chi tiết bài đăng theo slug")
        @GetMapping("/api/v1/jobs/slug/{slug}")
        @RateLimit(policy = "public-read", scope = RateLimitPolicy.Scope.IP)
        public ResponseEntity<ApiResponse<JobPostDetailResponse>> getBySlug(@PathVariable String slug) {
                return ResponseEntity.ok(ApiResponse.success(
                                JobPostDetailResponse.from(getJobDetailUseCase.executeBySlug(slug))));
        }
}