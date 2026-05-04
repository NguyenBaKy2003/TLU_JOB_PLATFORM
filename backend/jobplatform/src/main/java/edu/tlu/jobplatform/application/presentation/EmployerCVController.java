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

import edu.tlu.jobplatform.application.usecase.employer.ViewCandidateCVUseCase;

import java.util.UUID;

/**
 * Employer xem / tải CV của ứng viên đã nộp đơn vào công ty mình.
 *
 * Quyền truy cập được kiểm tra 2 lớp:
 * 1. Employer phải là owner của một company.
 * 2. Application được yêu cầu phải thuộc về company đó.
 *
 * GET /api/v1/employer/applications/{applicationId}/cv/view — Xem inline
 * GET /api/v1/employer/applications/{applicationId}/cv/download — Download
 * GET /api/v1/employer/applications/{applicationId}/cv/{cvId}/view — Xem cv cụ
 * thể
 * GET /api/v1/employer/applications/{applicationId}/cv/{cvId}/download —
 * Download cv cụ thể
 */
@RestController
@RequestMapping("/api/v1/employer/applications")
@RequiredArgsConstructor
@Tag(name = "Employer - CV", description = "Employer xem CV ứng viên")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('EMPLOYER','ADMIN','SUPER_ADMIN')")
public class EmployerCVController {

    private final ViewCandidateCVUseCase viewCVUseCase;

    // ── Xem CV từ Application (dùng cvUrl của Application) ───

    @Operation(summary = "Preview CV ứng viên trong tab mới (inline)")
    @GetMapping("/{applicationId}/cv/view")
    public ResponseEntity<InputStreamResource> viewApplicationCV(
            @PathVariable UUID applicationId) {

        ViewCandidateCVUseCase.Result result = viewCVUseCase.execute(applicationId, null);
        return streamResponse(result, "inline");
    }

    @Operation(summary = "Tải CV ứng viên về máy (attachment)")
    @GetMapping("/{applicationId}/cv/download")
    public ResponseEntity<InputStreamResource> downloadApplicationCV(
            @PathVariable UUID applicationId) {

        ViewCandidateCVUseCase.Result result = viewCVUseCase.execute(applicationId, null);
        return streamResponse(result, "attachment");
    }

    // ── Xem CV cụ thể theo cvId (candidate có nhiều CV) ──────

    @Operation(summary = "Preview một CV cụ thể của ứng viên (inline)")
    @GetMapping("/{applicationId}/cv/{cvId}/view")
    public ResponseEntity<InputStreamResource> viewSpecificCV(
            @PathVariable UUID applicationId,
            @PathVariable UUID cvId) {

        ViewCandidateCVUseCase.Result result = viewCVUseCase.execute(applicationId, cvId);
        return streamResponse(result, "inline");
    }

    @Operation(summary = "Tải một CV cụ thể của ứng viên (attachment)")
    @GetMapping("/{applicationId}/cv/{cvId}/download")
    public ResponseEntity<InputStreamResource> downloadSpecificCV(
            @PathVariable UUID applicationId,
            @PathVariable UUID cvId) {

        ViewCandidateCVUseCase.Result result = viewCVUseCase.execute(applicationId, cvId);
        return streamResponse(result, "attachment");
    }

    // ── Helper ────

    private ResponseEntity<InputStreamResource> streamResponse(
            ViewCandidateCVUseCase.Result result, String disposition) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        disposition + "; filename=\"" + result.fileName() + "\"")
                .contentType(MediaType.parseMediaType(result.contentType()))
                .contentLength(result.contentLength())
                .body(new InputStreamResource(result.inputStream()));
    }
}