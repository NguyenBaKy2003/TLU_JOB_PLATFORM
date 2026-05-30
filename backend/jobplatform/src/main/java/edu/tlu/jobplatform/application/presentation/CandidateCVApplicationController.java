package edu.tlu.jobplatform.application.presentation;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import edu.tlu.jobplatform.application.usecase.candidate.ViewOwnApplicationCVUseCase;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;

import java.util.UUID;

/**
 * Candidate xem / tải CV mà mình đã nộp trong một application.
 *
 * Quyền truy cập được kiểm tra 2 lớp:
 * 1. Người dùng phải có role CANDIDATE.
 * 2. Application được yêu cầu phải thuộc về chính candidate đang đăng nhập.
 *
 * GET /api/v1/candidate/applications/{applicationId}/cv/view — Xem inline
 * GET /api/v1/candidate/applications/{applicationId}/cv/download — Download
 */
@RestController
@RequestMapping("/api/v1/candidate/applications")
@RequiredArgsConstructor
@Tag(name = "Candidate - CV", description = "Candidate xem CV đã nộp trong đơn ứng tuyển")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('CANDIDATE','ADMIN')")
public class CandidateCVApplicationController {

    private final ViewOwnApplicationCVUseCase viewCVUseCase;

    // ── Xem CV inline trong tab mới ────────────────────────────────────────

    @Operation(summary = "Candidate xem CV đã nộp (inline)")
    @GetMapping("/{applicationId}/cv/view")
    @RateLimit(policy = "cv-stream", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<InputStreamResource> viewApplicationCV(
            @PathVariable UUID applicationId) {

        ViewOwnApplicationCVUseCase.Result result = viewCVUseCase.execute(applicationId);
        return streamResponse(result, "inline");
    }

    // ── Tải CV về máy ──────────────────────────────────────────────────────

    @Operation(summary = "Candidate tải CV đã nộp về máy (attachment)")
    @GetMapping("/{applicationId}/cv/download")
    @RateLimit(policy = "cv-stream", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<InputStreamResource> downloadApplicationCV(
            @PathVariable UUID applicationId) {

        ViewOwnApplicationCVUseCase.Result result = viewCVUseCase.execute(applicationId);
        return streamResponse(result, "attachment");
    }

    // ── Helper ─────────────────────────────────────────────────────────────

    private ResponseEntity<InputStreamResource> streamResponse(
            ViewOwnApplicationCVUseCase.Result result, String disposition) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        disposition + "; filename=\"" + result.fileName() + "\"")
                .contentType(MediaType.parseMediaType(result.contentType()))
                .contentLength(result.contentLength())
                .body(new InputStreamResource(result.inputStream()));
    }
}