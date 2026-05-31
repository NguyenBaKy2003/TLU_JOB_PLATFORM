package edu.tlu.jobplatform.admin.presentation;

import edu.tlu.jobplatform.admin.application.usecase.AdminCompanyUseCase;
import edu.tlu.jobplatform.admin.application.usecase.export.AdminExportCompaniesUseCase;
import edu.tlu.jobplatform.admin.presentation.dto.request.ReasonRequest;
import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
import edu.tlu.jobplatform.company.domain.repository.CompanyDocumentRepository;
import edu.tlu.jobplatform.company.domain.repository.CompanyGalleryRepository;
import edu.tlu.jobplatform.company.domain.repository.CompanyTeamMemberRepository;
import edu.tlu.jobplatform.company.presentation.dto.response.CompanyResponse;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
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

@RestController
@RequestMapping("/api/v1/admin/companies")
@RequiredArgsConstructor
@Tag(name = "Admin - Companies")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('ADMIN')")
public class AdminCompanyController {

    private final AdminCompanyUseCase adminCompanyUseCase;
    private final AdminExportCompaniesUseCase adminExportCompaniesUseCase;
    private final CompanyTeamMemberRepository teamMemberRepository;
    private final CompanyGalleryRepository galleryRepository;
    private final CompanyDocumentRepository documentRepository;

    // ── List / Search ─────────────────────────────────────────────────────────

    @Operation(summary = "Danh sách công ty — filter theo trạng thái xác thực")
    @GetMapping
    @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<ApiResponse<PageResponse<CompanyResponse>>> list(
            @RequestParam(required = false) VerificationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        var result = adminCompanyUseCase.list(status, pageable)
                .map(c -> buildAdminResponse(c));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    @GetMapping("/search")
    @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<ApiResponse<PageResponse<CompanyResponse>>> search(
            @RequestParam(required = false) VerificationStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String planCode,
            @RequestParam(required = false) Double minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {

        var pageable = PageRequest.of(page, pageSize, Sort.unsorted());
        var result = adminCompanyUseCase
                .adminSearch(status, keyword, city, size, planCode, minRating, pageable)
                .map(c -> buildAdminResponse(c));
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
    }

    // ── Detail ────────────────────────────────────────────────────────────────

    @Operation(summary = "Chi tiết công ty — admin thấy đầy đủ documents")
    @GetMapping("/{id}")
    @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<ApiResponse<CompanyResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                buildAdminResponse(adminCompanyUseCase.getById(id))));
    }

    // ── Actions ───────────────────────────────────────────────────────────────

    @Operation(summary = "Duyệt xác thực công ty")
    @PostMapping("/{id}/approve")
    @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
    @Loggable(action = "ADMIN_APPROVE_COMPANY", resourceType = "Company")
    public ResponseEntity<ApiResponse<CompanyResponse>> approve(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                buildAdminResponse(adminCompanyUseCase.approve(id)), "Công ty đã được xác thực."));
    }

    @Operation(summary = "Từ chối xác thực (kèm lý do)")
    @PostMapping("/{id}/reject")
    @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
    @Loggable(action = "ADMIN_REJECT_COMPANY", resourceType = "Company")
    public ResponseEntity<ApiResponse<CompanyResponse>> reject(
            @PathVariable UUID id,
            @Valid @RequestBody ReasonRequest req) {
        return ResponseEntity.ok(ApiResponse.success(
                buildAdminResponse(adminCompanyUseCase.reject(id, req.getReason())), "Đã từ chối xác thực."));
    }

    @Operation(summary = "Khoá công ty")
    @PostMapping("/{id}/suspend")
    @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
    @Loggable(action = "ADMIN_SUSPEND_COMPANY", resourceType = "Company")
    public ResponseEntity<ApiResponse<CompanyResponse>> suspend(
            @PathVariable UUID id,
            @Valid @RequestBody ReasonRequest req) {
        return ResponseEntity.ok(ApiResponse.success(
                buildAdminResponse(adminCompanyUseCase.suspend(id, req.getReason())), "Công ty đã bị khoá."));
    }

    @Operation(summary = "Mở khoá công ty")
    @PostMapping("/{id}/unsuspend")
    @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
    @Loggable(action = "ADMIN_UNSUSPEND_COMPANY", resourceType = "Company")
    public ResponseEntity<ApiResponse<CompanyResponse>> unsuspend(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                buildAdminResponse(adminCompanyUseCase.unsuspend(id)), "Công ty đã được mở khoá."));
    }

    // ── Export ────────────────────────────────────────────────────────────────

    @Operation(summary = "Xuất danh sách công ty ra Excel (.xlsx)")
    @GetMapping("/export/excel")
    @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam(required = false) VerificationStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String planCode,
            @RequestParam(required = false) Double minRating) {

        var cmd = new AdminExportCompaniesUseCase.Command(status, keyword, city, size, planCode, minRating);
        return adminExportCompaniesUseCase.execute(cmd, AdminExportCompaniesUseCase.Format.EXCEL)
                .toResponseEntity();
    }

    @Operation(summary = "Xuất danh sách công ty ra PDF")
    @GetMapping("/export/pdf")
    @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam(required = false) VerificationStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) String planCode,
            @RequestParam(required = false) Double minRating) {

        var cmd = new AdminExportCompaniesUseCase.Command(status, keyword, city, size, planCode, minRating);
        return adminExportCompaniesUseCase.execute(cmd, AdminExportCompaniesUseCase.Format.PDF)
                .toResponseEntity();
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private CompanyResponse buildAdminResponse(CompanyProfile company) {
        UUID id = company.getId();
        return CompanyResponse.forAdmin(
                company,
                teamMemberRepository.findVisibleByCompanyId(id),
                galleryRepository.findByCompanyId(id),
                documentRepository.findByCompanyId(id));
    }
}