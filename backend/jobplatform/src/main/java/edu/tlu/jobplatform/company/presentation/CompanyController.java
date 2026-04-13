package edu.tlu.jobplatform.company.presentation;

import edu.tlu.jobplatform.company.application.usecase.CreateCompanyUseCase;
import edu.tlu.jobplatform.company.application.usecase.UpdateCompanyCoverUseCase;
import edu.tlu.jobplatform.company.application.usecase.UpdateCompanyLogoUseCase;
import edu.tlu.jobplatform.company.application.usecase.UpdateCompanyUseCase;
import edu.tlu.jobplatform.company.application.usecase.VerifyCompanyUseCase;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.company.presentation.dto.CompanyResponse;
import edu.tlu.jobplatform.company.presentation.dto.CreateCompanyRequest;
import edu.tlu.jobplatform.company.presentation.dto.UpdateCompanyRequest;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.shared.security.CurrentUser;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import java.util.UUID;

/**
 * Endpoints:
 * GET /api/v1/companies — Danh sách công ty đã xác thực (public)
 * GET /api/v1/companies/{id} — Chi tiết công ty (public)
 * GET /api/v1/companies/slug/{slug} — Chi tiết theo slug (public)
 * POST /api/v1/companies — Tạo hồ sơ công ty (EMPLOYER)
 * PATCH /api/v1/companies/{id} — Cập nhật (EMPLOYER/ADMIN)
 * GET /api/v1/companies/my — Hồ sơ của tôi (EMPLOYER)
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Company", description = "Quản lý hồ sơ công ty")
public class CompanyController {

        private final CreateCompanyUseCase createUseCase;
        private final UpdateCompanyUseCase updateUseCase;
        private final VerifyCompanyUseCase verifyUseCase;
        private final CompanyRepository companyRepository;

        private final UpdateCompanyLogoUseCase updateLogoUseCase;
        private final UpdateCompanyCoverUseCase updateCoverUseCase;

        // ── Public endpoints ──────────────────────────────────────

        @Operation(summary = "Danh sách công ty đã xác thực")
        @GetMapping("/api/v1/companies")
        public ResponseEntity<ApiResponse<PageResponse<CompanyResponse>>> listVerified(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "12") int size) {

                var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                var result = companyRepository.findVerifiedCompanies(pageable)
                                .map(CompanyResponse::from);

                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Chi tiết công ty theo ID")
        @GetMapping("/api/v1/companies/{id}")
        public ResponseEntity<ApiResponse<CompanyResponse>> getById(@PathVariable UUID id) {
                CompanyProfile company = companyRepository.findById(id)
                                .orElseThrow(() -> ResourceNotFoundException.of("Company", id));
                return ResponseEntity.ok(ApiResponse.success(CompanyResponse.from(company)));
        }

        @Operation(summary = "Chi tiết công ty theo slug")
        @GetMapping("/api/v1/companies/slug/{slug}")
        public ResponseEntity<ApiResponse<CompanyResponse>> getBySlug(@PathVariable String slug) {
                CompanyProfile company = companyRepository.findBySlug(slug)
                                .orElseThrow(() -> new edu.tlu.jobplatform.shared.exception.ResourceNotFoundException(
                                                "Không tìm thấy công ty với slug: " + slug, "COMPANY_NOT_FOUND"));
                return ResponseEntity.ok(ApiResponse.success(CompanyResponse.from(company)));
        }

        // ── Employer endpoints ────────────────────────────────────

        @Operation(summary = "Xem hồ sơ công ty của tôi")
        @SecurityRequirement(name = "bearerAuth")
        @GetMapping("/api/v1/companies/my")
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<CompanyResponse>> getMyCompany() {
                UUID ownerId = SecurityUtils.getCurrentUserIdOrThrow();
                CompanyProfile company = companyRepository.findByOwnerId(ownerId)
                                .orElseThrow(() -> new edu.tlu.jobplatform.shared.exception.ResourceNotFoundException(
                                                "Bạn chưa có hồ sơ công ty.", "COMPANY_NOT_FOUND"));
                return ResponseEntity.ok(ApiResponse.success(CompanyResponse.from(company)));
        }

        @Operation(summary = "Tạo hồ sơ công ty")
        @SecurityRequirement(name = "bearerAuth")
        @PostMapping("/api/v1/companies")
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<CompanyResponse>> create(
                        @Valid @RequestBody CreateCompanyRequest req) {

                UUID ownerId = SecurityUtils.getCurrentUserIdOrThrow();
                CompanyProfile company = createUseCase.execute(new CreateCompanyUseCase.Command(
                                ownerId, req.getName(), req.getDescription(), req.getWebsite(),
                                req.getEmail(), req.getPhone(), req.getAddress(), req.getCity(),
                                req.getCountry(), req.getIndustry(), req.getSize(), req.getFoundedYear()));

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(CompanyResponse.from(company), "Hồ sơ công ty đã được tạo."));
        }

        @Operation(summary = "Cập nhật hồ sơ công ty")
        @SecurityRequirement(name = "bearerAuth")
        @PatchMapping("/api/v1/companies/{id}")
        @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN', 'SUPER_ADMIN')")
        public ResponseEntity<ApiResponse<CompanyResponse>> update(
                        @PathVariable UUID id,
                        @Valid @RequestBody UpdateCompanyRequest req) {

                CompanyProfile company = updateUseCase.execute(id, new UpdateCompanyUseCase.Command(
                                req.getName(), req.getDescription(), req.getWebsite(),
                                req.getEmail(), req.getPhone(), req.getAddress(), req.getCity(),
                                req.getCountry(), req.getIndustry(), req.getSize(), req.getFoundedYear(),
                                req.getLogoUrl(), req.getCoverImageUrl()));

                return ResponseEntity.ok(
                                ApiResponse.success(CompanyResponse.from(company), "Cập nhật thành công."));
        }

        @Operation(summary = "Cập nhật logo công ty")
        @PatchMapping(value = "/api/v1/companies/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<CompanyResponse>> updateLogo(
                        @CurrentUser UUID userId,
                        @RequestPart("file") MultipartFile file) {

                CompanyProfile company = updateLogoUseCase.execute(userId, file);
                return ResponseEntity.ok(
                                ApiResponse.success(CompanyResponse.from(company), "Logo đã được cập nhật."));
        }

        @Operation(summary = "Cập nhật ảnh bìa công ty")
        @PatchMapping(value = "/api/v1/companies/cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<CompanyResponse>> updateCover(
                        @CurrentUser UUID userId,
                        @RequestPart("file") MultipartFile file) {

                CompanyProfile company = updateCoverUseCase.execute(userId, file);
                return ResponseEntity.ok(
                                ApiResponse.success(CompanyResponse.from(company), "Ảnh bìa đã được cập nhật."));
        }

}