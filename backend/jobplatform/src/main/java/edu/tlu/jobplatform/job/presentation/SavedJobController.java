package edu.tlu.jobplatform.job.presentation;

import edu.tlu.jobplatform.job.domain.model.SavedJob;
import edu.tlu.jobplatform.job.domain.repository.JobPostRepository;
import edu.tlu.jobplatform.job.domain.repository.SavedJobRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Candidate endpoints:
 * POST /api/v1/jobs/{id}/save — Lưu/bỏ lưu (toggle)
 * GET /api/v1/jobs/saved — Danh sách bài đã lưu
 * DELETE /api/v1/jobs/{id}/save — Bỏ lưu
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Saved Jobs", description = "Việc làm đã lưu")
public class SavedJobController {

    private final SavedJobRepository savedJobRepository;
    private final JobPostRepository jobPostRepository;

    @Operation(summary = "Lưu / bỏ lưu bài đăng (toggle)")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/api/v1/jobs/{jobPostId}/save")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<Boolean>> toggle(@PathVariable UUID jobPostId) {

        UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();

        // Kiểm tra job tồn tại
        jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> ResourceNotFoundException.of("JobPost", jobPostId));

        if (savedJobRepository.existsByCandidateIdAndJobPostId(candidateId, jobPostId)) {
            savedJobRepository.deleteByCandidateIdAndJobPostId(candidateId, jobPostId);
            return ResponseEntity.ok(ApiResponse.success(false, "Đã bỏ lưu bài đăng."));
        }

        savedJobRepository.save(SavedJob.builder()
                .id(UUID.randomUUID())
                .candidateId(candidateId)
                .jobPostId(jobPostId)
                .savedAt(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(ApiResponse.success(true, "Đã lưu bài đăng."));
    }

    // @Operation(summary = "Danh sách bài đăng đã lưu")
    // @SecurityRequirement(name = "bearerAuth")
    // @GetMapping("/api/v1/jobs/saved")
    // @PreAuthorize("hasRole('CANDIDATE')")
    // public ResponseEntity<ApiResponse<PageResponse<JobPostResponse>>> getSaved(
    // @RequestParam(defaultValue = "0") int page,
    // @RequestParam(defaultValue = "10") int size) {

    // UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();
    // var pageable = PageRequest.of(page, size, Sort.by("savedAt").descending());

    // // Lấy savedJobs → map sang JobPost → map sang response
    // Page<JobPostResponse> result = savedJobRepository
    // .findByCandidateId(candidateId, pageable)
    // .map(saved -> jobPostRepository.findById(saved.getJobPostId())
    // .map(JobPostResponse::from)
    // .orElse(null))
    // .filter(r -> r != null);

    // return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    // }
}