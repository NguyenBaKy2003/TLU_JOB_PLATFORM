package edu.tlu.jobplatform.company.presentation;

import edu.tlu.jobplatform.company.application.usecase.*;
import edu.tlu.jobplatform.company.domain.model.*;
import edu.tlu.jobplatform.company.domain.repository.*;
import edu.tlu.jobplatform.company.presentation.dto.*;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.response.PageResponse;
import edu.tlu.jobplatform.shared.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * Endpoints:
 *
 * ── Public ──
 * GET /api/v1/companies Danh sách công ty đã xác thực
 * GET /api/v1/companies/{id} Chi tiết công ty theo ID
 * GET /api/v1/companies/slug/{slug} Chi tiết công ty theo slug
 *
 * ── Employer
 * GET /api/v1/companies/my Hồ sơ của tôi (có documents)
 * POST /api/v1/companies Tạo hồ sơ công ty
 * PATCH /api/v1/companies/{id} Cập nhật thông tin
 * PATCH /api/v1/companies/logo Upload logo
 * PATCH /api/v1/companies/cover Upload ảnh bìa
 *
 * ── Team members ─
 * POST /api/v1/companies/team Thêm thành viên
 * PATCH /api/v1/companies/team/{memberId} Cập nhật thành viên
 * PATCH /api/v1/companies/team/{memberId}/avatar Upload ảnh thành viên
 * DELETE /api/v1/companies/team/{memberId} Xoá thành viên
 *
 * ── Gallery ─
 * POST /api/v1/companies/gallery Upload ảnh gallery
 * DELETE /api/v1/companies/gallery/{imageId} Xoá ảnh gallery
 *
 * ── Documents ─
 * POST /api/v1/companies/documents Nộp tài liệu xác thực
 * GET /api/v1/companies/documents Danh sách tài liệu của tôi
 */
@RestController
@RequiredArgsConstructor
@Tag(name = "Company", description = "Quản lý hồ sơ công ty")
public class CompanyController {

        // ── Use cases ─
        private final CreateCompanyUseCase createUseCase;
        private final UpdateCompanyUseCase updateUseCase;
        private final UpdateCompanyLogoUseCase updateLogoUseCase;
        private final UpdateCompanyCoverUseCase updateCoverUseCase;
        private final AddTeamMemberUseCase addTeamMemberUseCase;
        private final UpdateTeamMemberUseCase updateTeamMemberUseCase;
        private final UploadTeamMemberAvatarUseCase uploadTeamMemberAvatarUseCase;
        private final UploadDocumentUseCase uploadDocumentUseCase;
        private final UploadGalleryImageUseCase uploadGalleryImageUseCase;

        // ── Repositories
        private final CompanyRepository companyRepository;
        private final CompanyTeamMemberRepository teamMemberRepository;
        private final CompanyDocumentRepository documentRepository;
        private final CompanyGalleryRepository galleryRepository;

        // ════════════════════════════════════════════════════════════
        // Public endpoints
        // ════════════════════════════════════════════════════════════

        @Operation(summary = "Danh sách công ty đã xác thực")
        @GetMapping("/api/v1/companies")
        public ResponseEntity<ApiResponse<PageResponse<CompanyResponse>>> listVerified(
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "12") int size) {

                var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
                var result = companyRepository.findVerifiedCompanies(pageable)
                                .map(c -> CompanyResponse.from(c,
                                                teamMemberRepository.findVisibleByCompanyId(c.getId()),
                                                galleryRepository.findByCompanyId(c.getId())));

                return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
        }

        @Operation(summary = "Chi tiết công ty theo ID")
        @GetMapping("/api/v1/companies/{id}")
        public ResponseEntity<ApiResponse<CompanyResponse>> getById(
                        @PathVariable UUID id,
                        Authentication auth) {

                CompanyProfile company = companyRepository.findById(id)
                                .orElseThrow(() -> ResourceNotFoundException.of("Company", id));

                return ResponseEntity.ok(ApiResponse.success(buildResponse(company, auth)));
        }

        @Operation(summary = "Chi tiết công ty theo slug")
        @GetMapping("/api/v1/companies/slug/{slug}")
        public ResponseEntity<ApiResponse<CompanyResponse>> getBySlug(
                        @PathVariable String slug,
                        Authentication auth) {

                CompanyProfile company = companyRepository.findBySlug(slug)
                                .orElseThrow(() -> ResourceNotFoundException.of("Company", slug));

                return ResponseEntity.ok(ApiResponse.success(buildResponse(company, auth)));
        }

        // ════════════════════════════════════════════════════════════
        // Employer — Company profile
        // ════════════════════════════════════════════════════════════

        @Operation(summary = "Xem hồ sơ công ty của tôi")
        @SecurityRequirement(name = "bearerAuth")
        @GetMapping("/api/v1/companies/my")
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<CompanyResponse>> getMyCompany(
                        @CurrentUser UUID userId) {

                CompanyProfile company = companyRepository.findByOwnerId(userId)
                                .orElseThrow(() -> ResourceNotFoundException.of("Company", userId));

                UUID companyId = company.getId();
                CompanyResponse response = CompanyResponse.forOwner(
                                company,
                                teamMemberRepository.findByCompanyId(companyId),
                                galleryRepository.findByCompanyId(companyId),
                                documentRepository.findByCompanyId(companyId));

                return ResponseEntity.ok(ApiResponse.success(response));
        }

        @Operation(summary = "Tạo hồ sơ công ty")
        @SecurityRequirement(name = "bearerAuth")
        @PostMapping("/api/v1/companies")
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<CompanyResponse>> create(
                        @CurrentUser UUID userId,
                        @Valid @RequestBody CreateCompanyRequest req) {

                CompanyProfile company = createUseCase.execute(new CreateCompanyUseCase.Command(
                                userId, req.getName(), req.getDescription(), req.getWebsite(),
                                req.getEmail(), req.getPhone(), req.getAddress(), req.getCity(),
                                req.getCountry(), req.getIndustry(), req.getSize(), req.getFoundedYear()));

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(
                                                CompanyResponse.from(company, List.of(), List.of()),
                                                "Hồ sơ công ty đã được tạo."));
        }

        @Operation(summary = "Cập nhật hồ sơ công ty")
        @SecurityRequirement(name = "bearerAuth")
        @PatchMapping("/api/v1/companies/{id}")
        @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN', 'SUPER_ADMIN')")
        public ResponseEntity<ApiResponse<CompanyResponse>> update(
                        @PathVariable UUID id,
                        @Valid @RequestBody UpdateCompanyRequest req,
                        Authentication auth) {

                CompanyProfile company = updateUseCase.execute(id, new UpdateCompanyUseCase.Command(
                                req.getName(), req.getDescription(), req.getWebsite(),
                                req.getEmail(), req.getPhone(), req.getAddress(), req.getCity(),
                                req.getCountry(), req.getIndustry(), req.getSize(), req.getFoundedYear(),
                                req.getLogoUrl(), req.getCoverImageUrl()));

                return ResponseEntity.ok(ApiResponse.success(
                                buildResponse(company, auth), "Cập nhật thành công."));
        }

        @Operation(summary = "Upload logo công ty")
        @SecurityRequirement(name = "bearerAuth")
        @PatchMapping(value = "/api/v1/companies/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<CompanyResponse>> updateLogo(
                        @CurrentUser UUID userId,
                        @RequestPart("file") MultipartFile file) {

                CompanyProfile company = updateLogoUseCase.execute(userId, file);
                return ResponseEntity.ok(ApiResponse.success(
                                CompanyResponse.from(company,
                                                teamMemberRepository.findVisibleByCompanyId(company.getId()),
                                                galleryRepository.findByCompanyId(company.getId())),
                                "Logo đã được cập nhật."));
        }

        @Operation(summary = "Upload ảnh bìa công ty")
        @SecurityRequirement(name = "bearerAuth")
        @PatchMapping(value = "/api/v1/companies/cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<CompanyResponse>> updateCover(
                        @CurrentUser UUID userId,
                        @RequestPart("file") MultipartFile file) {

                CompanyProfile company = updateCoverUseCase.execute(userId, file);
                return ResponseEntity.ok(ApiResponse.success(
                                CompanyResponse.from(company,
                                                teamMemberRepository.findVisibleByCompanyId(company.getId()),
                                                galleryRepository.findByCompanyId(company.getId())),
                                "Ảnh bìa đã được cập nhật."));
        }

        // ════════════════════════════════════════════════════════════
        // Employer — Team members
        // ════════════════════════════════════════════════════════════

        @Operation(summary = "Thêm thành viên đội ngũ")
        @SecurityRequirement(name = "bearerAuth")
        @PostMapping("/api/v1/companies/team")
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<CompanyResponse.TeamMemberDto>> addTeamMember(
                        @CurrentUser UUID userId,
                        @Valid @RequestBody AddTeamMemberRequest req) {

                UUID companyId = resolveCompanyId(userId);
                CompanyTeamMember member = addTeamMemberUseCase.execute(
                                new AddTeamMemberUseCase.Command(
                                                companyId, req.fullName(), req.jobTitle(),
                                                req.bio(), req.linkedinUrl(), req.displayOrder()));

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(
                                                CompanyResponse.TeamMemberDto.from(member), "Đã thêm thành viên."));
        }

        @Operation(summary = "Cập nhật thành viên đội ngũ")
        @SecurityRequirement(name = "bearerAuth")
        @PatchMapping("/api/v1/companies/team/{memberId}")
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<CompanyResponse.TeamMemberDto>> updateTeamMember(
                        @CurrentUser UUID userId,
                        @PathVariable UUID memberId,
                        @Valid @RequestBody UpdateTeamMemberRequest req) {

                UUID companyId = resolveCompanyId(userId);
                CompanyTeamMember member = updateTeamMemberUseCase.execute(
                                companyId, memberId,
                                new UpdateTeamMemberUseCase.Command(
                                                req.fullName(), req.jobTitle(), req.bio(),
                                                req.linkedinUrl(), req.displayOrder()));

                return ResponseEntity.ok(ApiResponse.success(
                                CompanyResponse.TeamMemberDto.from(member), "Đã cập nhật thành viên."));
        }

        @Operation(summary = "Upload ảnh thành viên đội ngũ")
        @SecurityRequirement(name = "bearerAuth")
        @PatchMapping(value = "/api/v1/companies/team/{memberId}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<CompanyResponse.TeamMemberDto>> uploadMemberAvatar(
                        @CurrentUser UUID userId,
                        @PathVariable UUID memberId,
                        @RequestPart("file") MultipartFile file) {

                UUID companyId = resolveCompanyId(userId);
                CompanyTeamMember member = uploadTeamMemberAvatarUseCase.execute(
                                companyId, memberId, file);

                return ResponseEntity.ok(ApiResponse.success(
                                CompanyResponse.TeamMemberDto.from(member), "Ảnh thành viên đã được cập nhật."));
        }

        @Operation(summary = "Xoá thành viên đội ngũ")
        @SecurityRequirement(name = "bearerAuth")
        @DeleteMapping("/api/v1/companies/team/{memberId}")
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<Void>> deleteTeamMember(
                        @CurrentUser UUID userId,
                        @PathVariable UUID memberId) {

                UUID companyId = resolveCompanyId(userId);
                CompanyTeamMember member = teamMemberRepository.findById(memberId)
                                .orElseThrow(() -> ResourceNotFoundException.of("TeamMember", memberId));

                if (!member.getCompanyId().equals(companyId))
                        throw new BusinessRuleException(
                                        "Bạn không có quyền xoá thành viên này.", "FORBIDDEN");

                teamMemberRepository.deleteById(memberId);
                return ResponseEntity.ok(ApiResponse.success(null, "Đã xoá thành viên."));
        }

        // ════════════════════════════════════════════════════════════
        // Employer — Gallery
        // ════════════════════════════════════════════════════════════

        @Operation(summary = "Upload ảnh gallery công ty (1 hoặc nhiều ảnh)")
        @SecurityRequirement(name = "bearerAuth")
        @PostMapping(value = "/api/v1/companies/gallery", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<List<CompanyResponse.GalleryImageDto>>> uploadGalleryImages(
                        @CurrentUser UUID userId,
                        @RequestPart(value = "files", required = false) List<MultipartFile> files,
                        @RequestPart(value = "file", required = false) MultipartFile singleFile,
                        @RequestParam(required = false) List<String> captions) {

                // Gộp lại — ưu tiên "files", fallback về "file"
                List<MultipartFile> allFiles;
                if (files != null && !files.isEmpty()) {
                        allFiles = files;
                } else if (singleFile != null) {
                        allFiles = List.of(singleFile);
                } else {
                        throw new BusinessRuleException("Vui lòng chọn ít nhất 1 ảnh.", "NO_FILE_PROVIDED");
                }

                UUID companyId = resolveCompanyId(userId);
                List<CompanyGalleryImage> images = uploadGalleryImageUseCase.execute(companyId, allFiles, captions);

                List<CompanyResponse.GalleryImageDto> dtos = images.stream()
                                .map(CompanyResponse.GalleryImageDto::from)
                                .toList();

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(dtos, "Đã upload " + dtos.size() + " ảnh."));
        }

        @Operation(summary = "Xoá ảnh gallery")
        @SecurityRequirement(name = "bearerAuth")
        @DeleteMapping("/api/v1/companies/gallery/{imageId}")
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<Void>> deleteGalleryImage(
                        @CurrentUser UUID userId,
                        @PathVariable UUID imageId) {

                UUID companyId = resolveCompanyId(userId);
                CompanyGalleryImage image = galleryRepository.findById(imageId)
                                .orElseThrow(() -> ResourceNotFoundException.of("GalleryImage", imageId));

                if (!image.getCompanyId().equals(companyId))
                        throw new BusinessRuleException(
                                        "Bạn không có quyền xoá ảnh này.", "FORBIDDEN");

                galleryRepository.deleteById(imageId);
                return ResponseEntity.ok(ApiResponse.success(null, "Đã xoá ảnh."));
        }

        // ════════════════════════════════════════════════════════════
        // Employer — Documents
        // ════════════════════════════════════════════════════════════

        @Operation(summary = "Nộp tài liệu xác thực công ty")
        @SecurityRequirement(name = "bearerAuth")
        @PostMapping(value = "/api/v1/companies/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<CompanyResponse.DocumentDto>> uploadDocument(
                        @CurrentUser UUID userId,
                        @RequestParam CompanyDocumentType type,
                        @RequestPart("file") MultipartFile file) {

                UUID companyId = resolveCompanyId(userId);
                CompanyDocument doc = uploadDocumentUseCase.execute(companyId, type, file);

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(
                                                CompanyResponse.DocumentDto.from(doc),
                                                "Tài liệu đã được nộp."));
        }

        @Operation(summary = "Danh sách tài liệu của công ty tôi")
        @SecurityRequirement(name = "bearerAuth")
        @GetMapping("/api/v1/companies/documents")
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<List<CompanyResponse.DocumentDto>>> myDocuments(
                        @CurrentUser UUID userId) {

                UUID companyId = resolveCompanyId(userId);
                List<CompanyResponse.DocumentDto> docs = documentRepository
                                .findByCompanyId(companyId)
                                .stream()
                                .map(CompanyResponse.DocumentDto::from)
                                .toList();

                return ResponseEntity.ok(ApiResponse.success(docs));
        }

        // ════════════════════════════════════════════════════════════
        // Helpers
        // ════════════════════════════════════════════════════════════

        /**
         * Build CompanyResponse dựa theo role của caller:
         * - ADMIN / SUPER_ADMIN → forAdmin (có documents)
         * - Public / Candidate → from (không có documents)
         */
        private CompanyResponse buildResponse(CompanyProfile company, Authentication auth) {
                UUID id = company.getId();
                List<CompanyTeamMember> team = teamMemberRepository.findVisibleByCompanyId(id);
                List<CompanyGalleryImage> gallery = galleryRepository.findByCompanyId(id);

                boolean isAdmin = auth != null && auth.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                                                || a.getAuthority().equals("ROLE_SUPER_ADMIN"));

                if (isAdmin) {
                        return CompanyResponse.forAdmin(company, team, gallery,
                                        documentRepository.findByCompanyId(id));
                }
                return CompanyResponse.from(company, team, gallery);
        }

        /** Lấy companyId từ ownerId — throw nếu chưa có hồ sơ */
        private UUID resolveCompanyId(UUID ownerId) {
                return companyRepository.findByOwnerId(ownerId)
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Bạn chưa có hồ sơ công ty. Vui lòng tạo hồ sơ trước.",
                                                "COMPANY_PROFILE_NOT_FOUND"))
                                .getId();
        }
}