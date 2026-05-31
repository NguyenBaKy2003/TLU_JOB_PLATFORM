package edu.tlu.jobplatform.company.presentation;

import edu.tlu.jobplatform.ai.application.usecase.TrackCandidateBehaviorUseCase;
import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.company.application.usecase.*;
import edu.tlu.jobplatform.company.domain.model.*;
import edu.tlu.jobplatform.company.domain.repository.*;
import edu.tlu.jobplatform.company.presentation.dto.request.AddTeamMemberRequest;
import edu.tlu.jobplatform.company.presentation.dto.request.CreateCompanyRequest;
import edu.tlu.jobplatform.company.presentation.dto.request.UpdateCompanyRequest;
import edu.tlu.jobplatform.company.presentation.dto.request.UpdateTeamMemberRequest;
import edu.tlu.jobplatform.company.presentation.dto.response.CompanyResponse;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
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

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Company", description = "Quản lý hồ sơ công ty")
public class CompanyController {

        // ── Use cases ─────────────────────────────────────────────────────────────
        private final CreateCompanyUseCase createUseCase;
        private final UpdateCompanyUseCase updateUseCase;
        private final UpdateCompanyLogoUseCase updateLogoUseCase;
        private final UpdateCompanyCoverUseCase updateCoverUseCase;
        private final AddTeamMemberUseCase addTeamMemberUseCase;
        private final UpdateTeamMemberUseCase updateTeamMemberUseCase;
        private final UploadTeamMemberAvatarUseCase uploadTeamMemberAvatarUseCase;
        private final UploadDocumentUseCase uploadDocumentUseCase;
        private final UploadGalleryImageUseCase uploadGalleryImageUseCase;
        private final TrackCandidateBehaviorUseCase trackUseCase;
        private final GetCompanyJobsUseCase getCompanyJobsUseCase;
        private final SearchCompaniesUseCase searchCompaniesUseCase;

        // ── Repositories ──────────────────────────────────────────────────────────
        private final CompanyRepository companyRepository;
        private final CompanyTeamMemberRepository teamMemberRepository;
        private final CompanyDocumentRepository documentRepository;
        private final CompanyGalleryRepository galleryRepository;

        // ════════════════════════════════════════════════════════════
        // Public endpoints
        // ════════════════════════════════════════════════════════════

        /**
         * GET /api/v1/companies
         *
         * Không truyền param → trả toàn bộ công ty VERIFIED, sort plan tier.
         * Truyền param → tìm kiếm đa điều kiện, giữ nguyên sort plan tier → rating
         * DESC.
         */
        @Operation(summary = "Danh sách / tìm kiếm công ty (sort: gói cao nhất lên đầu)")
        @GetMapping("/api/v1/companies")
        @RateLimit(policy = "public-read", scope = RateLimitPolicy.Scope.IP)
        public ResponseEntity<ApiResponse<PageResponse<CompanyResponse>>> listVerified(
                        @RequestParam(required = false) String keyword,
                        @RequestParam(required = false) String city,
                        @RequestParam(required = false) String size,
                        @RequestParam(required = false) String planCode,
                        @RequestParam(required = false) Double minRating,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "12") int pageSize) {

                return ResponseEntity.ok(ApiResponse.success(
                                searchCompaniesUseCase.execute(
                                                new SearchCompaniesUseCase.Command(
                                                                keyword, city, size, planCode,
                                                                minRating, page, pageSize))));
        }

        @Operation(summary = "Chi tiết công ty theo ID")
        @GetMapping("/api/v1/companies/{id}")
        @RateLimit(policy = "public-read", scope = RateLimitPolicy.Scope.IP)
        public ResponseEntity<ApiResponse<CompanyResponse>> getById(
                        @PathVariable UUID id,
                        Authentication auth) {

                CompanyProfile company = companyRepository.findById(id)
                                .orElseThrow(() -> ResourceNotFoundException.of("Company", id));

                companyRepository.enrichWithStats(company);

                SecurityUtils.getCurrentUserId().ifPresent(
                                userId -> trackUseCase.trackCompanyView(userId, id));

                return ResponseEntity.ok(ApiResponse.success(buildResponse(company, auth)));
        }

        @Operation(summary = "Chi tiết công ty theo slug")
        @GetMapping("/api/v1/companies/slug/{slug}")
        @RateLimit(policy = "public-read", scope = RateLimitPolicy.Scope.IP)
        public ResponseEntity<ApiResponse<CompanyResponse>> getBySlug(
                        @PathVariable String slug,
                        Authentication auth) {

                CompanyProfile company = companyRepository.findBySlug(slug)
                                .orElseThrow(() -> ResourceNotFoundException.of("Company", slug));

                companyRepository.enrichWithStats(company);

                return ResponseEntity.ok(ApiResponse.success(buildResponse(company, auth)));
        }

        @Operation(summary = "Danh sách việc làm đang tuyển của công ty")
        @GetMapping("/api/v1/companies/{id}/jobs")
        @RateLimit(policy = "public-read", scope = RateLimitPolicy.Scope.IP)
        public ResponseEntity<ApiResponse<PageResponse<JobPost>>> getCompanyJobs(
                        @PathVariable UUID id,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {

                companyRepository.findById(id)
                                .orElseThrow(() -> ResourceNotFoundException.of("Company", id));

                return ResponseEntity.ok(ApiResponse.success(
                                getCompanyJobsUseCase.execute(
                                                new GetCompanyJobsUseCase.Command(id, page, size))));
        }

        // ════════════════════════════════════════════════════════════
        // Employer — Company profile
        // ════════════════════════════════════════════════════════════

        @Operation(summary = "Xem hồ sơ công ty của tôi")
        @SecurityRequirement(name = "bearerAuth")
        @GetMapping("/api/v1/companies/my")
        @RateLimit(policy = "employer-read", scope = RateLimitPolicy.Scope.USER)
        @PreAuthorize("hasRole('EMPLOYER')")
        public ResponseEntity<ApiResponse<CompanyResponse>> getMyCompany(@CurrentUser UUID userId) {

                CompanyProfile company = companyRepository.findByOwnerId(userId)
                                .orElseThrow(() -> ResourceNotFoundException.of("Company", userId));

                companyRepository.enrichWithStats(company);

                Map<UUID, String> planMap = companyRepository
                                .findActivePlanCodesByCompanyIds(Set.of(company.getId()));
                String planCode = planMap.get(company.getId());

                UUID companyId = company.getId();
                return ResponseEntity.ok(ApiResponse.success(
                                CompanyResponse.forOwner(
                                                company,
                                                teamMemberRepository.findByCompanyId(companyId),
                                                galleryRepository.findByCompanyId(companyId),
                                                documentRepository.findByCompanyId(companyId),
                                                planCode)));
        }

        @Operation(summary = "Tạo hồ sơ công ty")
        @SecurityRequirement(name = "bearerAuth")
        @PostMapping("/api/v1/companies")
        @RateLimit(policy = "employer-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_CREATE_COMPANY", resourceType = "Company")
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
        @RateLimit(policy = "employer-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_UPDATE_COMPANY", resourceType = "Company")
        @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
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
        @RateLimit(policy = "cv-upload", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_UPDATE_LOGO", resourceType = "Company")
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
        @RateLimit(policy = "cv-upload", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_UPDATE_COVER", resourceType = "Company")
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
        @RateLimit(policy = "employer-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_ADD_TEAM_MEMBER", resourceType = "Company")
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
        @RateLimit(policy = "employer-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_UPDATE_TEAM_MEMBER", resourceType = "Company")
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
        @RateLimit(policy = "cv-upload", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_UPDATE_MEMBER_AVATAR", resourceType = "Company")
        public ResponseEntity<ApiResponse<CompanyResponse.TeamMemberDto>> uploadMemberAvatar(
                        @CurrentUser UUID userId,
                        @PathVariable UUID memberId,
                        @RequestPart("file") MultipartFile file) {

                UUID companyId = resolveCompanyId(userId);
                CompanyTeamMember member = uploadTeamMemberAvatarUseCase.execute(companyId, memberId, file);

                return ResponseEntity.ok(ApiResponse.success(
                                CompanyResponse.TeamMemberDto.from(member), "Ảnh thành viên đã được cập nhật."));
        }

        @Operation(summary = "Xoá thành viên đội ngũ")
        @SecurityRequirement(name = "bearerAuth")
        @DeleteMapping("/api/v1/companies/team/{memberId}")
        @PreAuthorize("hasRole('EMPLOYER')")
        @RateLimit(policy = "employer-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_DELETE_TEAM_MEMBER", resourceType = "Company")
        public ResponseEntity<ApiResponse<Void>> deleteTeamMember(
                        @CurrentUser UUID userId,
                        @PathVariable UUID memberId) {

                UUID companyId = resolveCompanyId(userId);
                CompanyTeamMember member = teamMemberRepository.findById(memberId)
                                .orElseThrow(() -> ResourceNotFoundException.of("TeamMember", memberId));

                if (!member.getCompanyId().equals(companyId))
                        throw new BusinessRuleException("Bạn không có quyền xoá thành viên này.", "FORBIDDEN");

                teamMemberRepository.deleteById(memberId);
                return ResponseEntity.ok(ApiResponse.success(null, "Đã xoá thành viên."));
        }

        // ════════════════════════════════════════════════════════════
        // Employer — Gallery
        // ════════════════════════════════════════════════════════════

        @Operation(summary = "Upload ảnh gallery công ty")
        @SecurityRequirement(name = "bearerAuth")
        @PostMapping(value = "/api/v1/companies/gallery", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @PreAuthorize("hasRole('EMPLOYER')")
        @RateLimit(policy = "cv-upload", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_UPLOAD_GALLERY", resourceType = "Company")
        public ResponseEntity<ApiResponse<List<CompanyResponse.GalleryImageDto>>> uploadGalleryImages(
                        @CurrentUser UUID userId,
                        @RequestPart(value = "files", required = false) List<MultipartFile> files,
                        @RequestPart(value = "file", required = false) MultipartFile singleFile,
                        @RequestParam(required = false) List<String> captions) {

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
        @RateLimit(policy = "employer-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_DELETE_GALLERY_IMAGE", resourceType = "Company")
        public ResponseEntity<ApiResponse<Void>> deleteGalleryImage(
                        @CurrentUser UUID userId,
                        @PathVariable UUID imageId) {

                UUID companyId = resolveCompanyId(userId);
                CompanyGalleryImage image = galleryRepository.findById(imageId)
                                .orElseThrow(() -> ResourceNotFoundException.of("GalleryImage", imageId));

                if (!image.getCompanyId().equals(companyId))
                        throw new BusinessRuleException("Bạn không có quyền xoá ảnh này.", "FORBIDDEN");

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
        @RateLimit(policy = "cv-upload", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_UPLOAD_DOCUMENT", resourceType = "Company")
        public ResponseEntity<ApiResponse<CompanyResponse.DocumentDto>> uploadDocument(
                        @CurrentUser UUID userId,
                        @RequestParam CompanyDocumentType type,
                        @RequestPart("file") MultipartFile file) {

                UUID companyId = resolveCompanyId(userId);
                CompanyDocument doc = uploadDocumentUseCase.execute(companyId, type, file);

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(
                                                CompanyResponse.DocumentDto.from(doc), "Tài liệu đã được nộp."));
        }

        @Operation(summary = "Danh sách tài liệu của công ty tôi")
        @SecurityRequirement(name = "bearerAuth")
        @GetMapping("/api/v1/companies/documents")
        @PreAuthorize("hasRole('EMPLOYER')")
        @RateLimit(policy = "cv-upload", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "EMPLOYER_UPLOAD_DOCUMENT", resourceType = "Company")
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

                String planCode = companyRepository
                                .findActivePlanCodesByCompanyIds(Set.of(id))
                                .get(id);

                return CompanyResponse.from(company, team, gallery, planCode);
        }

        private UUID resolveCompanyId(UUID ownerId) {
                return companyRepository.findByOwnerId(ownerId)
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Bạn chưa có hồ sơ công ty. Vui lòng tạo hồ sơ trước.",
                                                "COMPANY_PROFILE_NOT_FOUND"))
                                .getId();
        }
}