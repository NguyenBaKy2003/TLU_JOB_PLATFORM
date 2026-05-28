package edu.tlu.jobplatform.job.presentation;

import edu.tlu.jobplatform.ai.application.usecase.TrackCandidateBehaviorUseCase;
import edu.tlu.jobplatform.job.application.usecase.candidate.GetSavedJobsUseCase;
import edu.tlu.jobplatform.job.application.usecase.candidate.SaveJobUseCase;
import edu.tlu.jobplatform.job.domain.repository.SavedJobRepository;
import edu.tlu.jobplatform.job.presentation.dto.response.MySavedJobsResponse;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Saved Jobs", description = "Việc làm đã lưu")
public class SavedJobController {

    private final SaveJobUseCase saveJobUseCase;
    private final GetSavedJobsUseCase getSavedJobsUseCase;
    private final SavedJobRepository savedJobRepository;
    private final TrackCandidateBehaviorUseCase trackUseCase;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("savedAt");

    @Operation(summary = "Lưu / bỏ lưu bài đăng (toggle)")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/api/v1/jobs/{jobPostId}/save")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Boolean>> toggle(@PathVariable UUID jobPostId) {

        UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();
        boolean saved = saveJobUseCase.toggle(candidateId, jobPostId);
        String message = saved ? "Đã lưu bài đăng." : "Đã bỏ lưu bài đăng.";

        if (saved) {
            trackUseCase.trackJobSave(candidateId, jobPostId);
        }

        return ResponseEntity.ok(ApiResponse.success(saved, message));
    }

    @Operation(summary = "Danh sách bài đăng đã lưu")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/api/v1/jobs/saved")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<MySavedJobsResponse>> getSaved(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate savedAtFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate savedAtTo,
            @RequestParam(defaultValue = "savedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();

        if (!ALLOWED_SORT_FIELDS.contains(sortBy))
            sortBy = "savedAt";
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        LocalDateTime fromDt = savedAtFrom != null ? savedAtFrom.atStartOfDay() : null;
        LocalDateTime toDt = savedAtTo != null ? savedAtTo.atTime(LocalTime.MAX) : null;

        var pageable = PageRequest.of(page, size, sort);
        GetSavedJobsUseCase.Result result = getSavedJobsUseCase.execute(
                candidateId, keyword, jobType, category, fromDt, toDt, pageable);

        long totalSaved = result.categoryCounts().values().stream()
                .mapToLong(Long::longValue).sum();

        MySavedJobsResponse response = MySavedJobsResponse.builder()
                .jobs(PageResponse.from(result.jobs()))
                .categoryCounts(result.categoryCounts())
                .totalSaved(totalSaved)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Kiểm tra đã lưu bài đăng này chưa")
    @GetMapping("/api/v1/jobs/{jobPostId}/saved")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Boolean>> checkSaved(@PathVariable UUID jobPostId) {
        UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();
        boolean saved = savedJobRepository.existsByCandidateIdAndJobPostId(candidateId, jobPostId);
        return ResponseEntity.ok(ApiResponse.success(saved));
    }
}