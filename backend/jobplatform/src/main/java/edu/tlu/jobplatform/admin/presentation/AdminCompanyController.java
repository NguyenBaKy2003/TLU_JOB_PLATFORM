package edu.tlu.jobplatform.admin.presentation;

import edu.tlu.jobplatform.admin.application.usecase.AdminCompanyUseCase;
import edu.tlu.jobplatform.admin.presentation.dto.request.ReasonRequest;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
import edu.tlu.jobplatform.company.presentation.dto.CompanyResponse;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * GET /api/v1/admin/companies — Danh sách (filter theo verification status)
 * GET /api/v1/admin/companies/{id} — Chi tiết
 * POST /api/v1/admin/companies/{id}/approve — Duyệt xác thực
 * POST /api/v1/admin/companies/{id}/reject — Từ chối (kèm lý do)
 * POST /api/v1/admin/companies/{id}/suspend — Khoá
 * POST /api/v1/admin/companies/{id}/unsuspend — Mở khoá
 */
@RestController
@RequestMapping("/api/v1/admin/companies")
@RequiredArgsConstructor
@Tag(name = "Admin - Companies")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
public class AdminCompanyController {

    private final AdminCompanyUseCase adminCompanyUseCase;

    @Operation(summary = "Danh sách công ty — filter theo trạng thái xác thực")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CompanyResponse>>> list(
            @RequestParam(required = false) VerificationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var result = adminCompanyUseCase.list(status, pageable).map(CompanyResponse::from);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @Operation(summary = "Chi tiết công ty")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.success(CompanyResponse.from(adminCompanyUseCase.getById(id))));
    }

    @Operation(summary = "Duyệt xác thực công ty")
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<CompanyResponse>> approve(@PathVariable UUID id) {
        CompanyProfile company = adminCompanyUseCase.approve(id);
        return ResponseEntity.ok(
                ApiResponse.success(CompanyResponse.from(company), "Công ty đã được xác thực."));
    }

    @Operation(summary = "Từ chối xác thực (kèm lý do)")
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<CompanyResponse>> reject(
            @PathVariable UUID id,
            @Valid @RequestBody ReasonRequest req) {
        CompanyProfile company = adminCompanyUseCase.reject(id, req.getReason());
        return ResponseEntity.ok(
                ApiResponse.success(CompanyResponse.from(company), "Đã từ chối xác thực."));
    }

    @Operation(summary = "Khoá công ty")
    @PostMapping("/{id}/suspend")
    public ResponseEntity<ApiResponse<CompanyResponse>> suspend(
            @PathVariable UUID id,
            @Valid @RequestBody ReasonRequest req) {
        CompanyProfile company = adminCompanyUseCase.suspend(id, req.getReason());
        return ResponseEntity.ok(
                ApiResponse.success(CompanyResponse.from(company), "Công ty đã bị khoá."));
    }

    @Operation(summary = "Mở khoá công ty")
    @PostMapping("/{id}/unsuspend")
    public ResponseEntity<ApiResponse<CompanyResponse>> unsuspend(@PathVariable UUID id) {
        CompanyProfile company = adminCompanyUseCase.unsuspend(id);
        return ResponseEntity.ok(
                ApiResponse.success(CompanyResponse.from(company), "Công ty đã được mở khoá."));
    }
}