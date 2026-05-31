package edu.tlu.jobplatform.cv.presentation;

import edu.tlu.jobplatform.ai.domain.model.CvOptimizationResult;
import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.cv.application.usecase.*;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.model.vo.PersonalInfo;
import edu.tlu.jobplatform.cv.presentation.dto.request.*;
import edu.tlu.jobplatform.cv.presentation.dto.response.*;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cv")
@RequiredArgsConstructor
@Tag(name = "CV Builder", description = "Tạo và quản lý CV online")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('CANDIDATE')")
public class OnlineCVController {

        private final CreateOnlineCVUseCase createUseCase;
        private final UpdateOnlineCVUseCase updateUseCase;
        private final UpdateCVSectionUseCase updateSectionUseCase;
        private final DeleteCVSectionUseCase deleteSectionUseCase;
        private final ReorderSectionsUseCase reorderUseCase;
        private final PublishCVUseCase publishUseCase;
        private final ArchiveCVUseCase archiveUseCase;
        private final RestoreCVUseCase restoreUseCase;
        private final DuplicateCVUseCase duplicateUseCase;
        private final ExportCVUseCase exportUseCase;
        private final DeleteOnlineCVUseCase deleteUseCase;
        private final GetMyCVsUseCase getMyCVsUseCase;
        private final GetCVDetailUseCase getCVDetailUseCase;
        private final ImportFromProfileUseCase importFromProfileUseCase;
        private final PreviewCVUseCase previewCVUseCase;
        private final DownloadExportedCVUseCase downloadExportedCVUseCase;
        private final AiOptimizeCVUseCase aiOptimizeCVUseCase;

        // ── GET /api/v1/cv ────────────────────────────────────────────────

        @Operation(summary = "Danh sách CV của tôi")
        @GetMapping
        @RateLimit(policy = "candidate-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<List<OnlineCVResponse>>> listMyCVs(
                        @CurrentUser UUID candidateId) {
                List<OnlineCVResponse> list = getMyCVsUseCase.execute(candidateId)
                                .stream().map(OnlineCVResponse::from).toList();
                return ResponseEntity.ok(ApiResponse.success(list));
        }

        // ── POST /api/v1/cv ───────────────────────────────────────────────

        @Operation(summary = "Tạo CV mới", description = """
                        Tạo CV mới ở trạng thái DRAFT từ template được chọn.
                        - Tối đa **10 CV** mỗi tài khoản.
                        - Template **premium** (có nhãn ⭐) yêu cầu gói **PRO trở lên**.
                          Gửi `templateId` của template thường nếu chưa có gói.
                        """)
        @PostMapping
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_CREATE_ONLINE_CV", resourceType = "OnlineCV")
        public ResponseEntity<ApiResponse<OnlineCVDetailResponse>> createCV(
                        @CurrentUser UUID candidateId,
                        @Valid @RequestBody CreateOnlineCVRequest req) {
                OnlineCV cv = createUseCase.execute(new CreateOnlineCVUseCase.Command(
                                candidateId, req.getTitle(), req.getTemplateId()));
                return ResponseEntity.ok(ApiResponse.success(
                                OnlineCVDetailResponse.from(cv), "CV đã được tạo thành công."));
        }

        // ── GET /api/v1/cv/{cvId} ─────────────────────────────────────────

        @Operation(summary = "Chi tiết CV (để chỉnh sửa)")
        @GetMapping("/{cvId}")
        @RateLimit(policy = "candidate-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<OnlineCVDetailResponse>> getCVDetail(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId) {
                OnlineCV cv = getCVDetailUseCase.execute(cvId, candidateId);
                return ResponseEntity.ok(ApiResponse.success(OnlineCVDetailResponse.from(cv)));
        }

        // ── PUT /api/v1/cv/{cvId} ─────────────────────────────────────────

        @Operation(summary = "Cập nhật metadata CV", description = """
                        Cập nhật: tiêu đề, thông tin cá nhân, template, visibility.
                        Đổi sang **premium template** yêu cầu gói **PRO trở lên**.
                        """)
        @PutMapping("/{cvId}")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_UPDATE_ONLINE_CV", resourceType = "OnlineCV")
        public ResponseEntity<ApiResponse<OnlineCVDetailResponse>> updateCV(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId,
                        @Valid @RequestBody UpdateOnlineCVRequest req) {
                PersonalInfo pi = buildPersonalInfo(req.getPersonalInfo());
                OnlineCV cv = updateUseCase.execute(new UpdateOnlineCVUseCase.Command(
                                cvId, candidateId, req.getTitle(), pi, req.getTemplateId(), req.getVisibility()));
                return ResponseEntity.ok(ApiResponse.success(
                                OnlineCVDetailResponse.from(cv), "CV đã được cập nhật."));
        }

        // ── DELETE /api/v1/cv/{cvId} ──────────────────────────────────────

        @Operation(summary = "Xóa CV")
        @DeleteMapping("/{cvId}")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_DELETE_ONLINE_CV", resourceType = "OnlineCV")
        public ResponseEntity<ApiResponse<Void>> deleteCV(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId) {
                deleteUseCase.execute(cvId, candidateId);
                return ResponseEntity.ok(ApiResponse.success("CV đã được xóa."));
        }

        // ── POST /api/v1/cv/{cvId}/sections ──────────────────────────────

        @Operation(summary = "Thêm section mới vào CV")
        @PostMapping("/{cvId}/sections")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<CVSectionResponse>> addSection(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId,
                        @Valid @RequestBody UpdateCVSectionRequest req) {
                var section = updateSectionUseCase.execute(new UpdateCVSectionUseCase.Command(
                                cvId, candidateId, null, req.getType(),
                                req.getTitle(), req.getContent(), req.isVisible()));
                return ResponseEntity.ok(ApiResponse.success(
                                CVSectionResponse.from(section), "Section đã được thêm."));
        }

        // ── PUT /api/v1/cv/{cvId}/sections/{sectionId} ───────────────────

        @Operation(summary = "Cập nhật nội dung section")
        @PutMapping("/{cvId}/sections/{sectionId}")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<CVSectionResponse>> updateSection(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId,
                        @PathVariable UUID sectionId,
                        @Valid @RequestBody UpdateCVSectionRequest req) {
                var section = updateSectionUseCase.execute(new UpdateCVSectionUseCase.Command(
                                cvId, candidateId, sectionId, null,
                                req.getTitle(), req.getContent(), req.isVisible()));
                return ResponseEntity.ok(ApiResponse.success(
                                CVSectionResponse.from(section), "Section đã được cập nhật."));
        }

        // ── DELETE /api/v1/cv/{cvId}/sections/{sectionId} ────────────────

        @Operation(summary = "Xóa section khỏi CV")
        @DeleteMapping("/{cvId}/sections/{sectionId}")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<Void>> deleteSection(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId,
                        @PathVariable UUID sectionId) {
                deleteSectionUseCase.execute(cvId, candidateId, sectionId);
                return ResponseEntity.ok(ApiResponse.success("Section đã được xóa."));
        }

        // ── PATCH /api/v1/cv/{cvId}/sections/reorder ─────────────────────

        @Operation(summary = "Sắp xếp lại thứ tự sections")
        @PatchMapping("/{cvId}/sections/reorder")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<OnlineCVDetailResponse>> reorderSections(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId,
                        @Valid @RequestBody ReorderSectionsRequest req) {
                OnlineCV cv = reorderUseCase.execute(new ReorderSectionsUseCase.Command(
                                cvId, candidateId, req.getSectionIds()));
                return ResponseEntity.ok(ApiResponse.success(
                                OnlineCVDetailResponse.from(cv), "Thứ tự sections đã được cập nhật."));
        }

        // ── POST /api/v1/cv/{cvId}/publish ───────────────────────────────

        @Operation(summary = "Publish CV")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_PUBLISH_CV", resourceType = "OnlineCV")
        public ResponseEntity<ApiResponse<OnlineCVDetailResponse>> publishCV(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId) {
                OnlineCV cv = publishUseCase.execute(cvId, candidateId);
                return ResponseEntity.ok(ApiResponse.success(
                                OnlineCVDetailResponse.from(cv),
                                "CV đã được publish. Slug: " + cv.getSlug()));
        }

        // ── POST /api/v1/cv/{cvId}/archive ───────────────────────────────

        @Operation(summary = "Archive CV")
        @PostMapping("/{cvId}/archive")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_ARCHIVE_CV", resourceType = "OnlineCV")
        public ResponseEntity<ApiResponse<OnlineCVDetailResponse>> archiveCV(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId) {
                OnlineCV cv = archiveUseCase.execute(cvId, candidateId);
                return ResponseEntity.ok(ApiResponse.success(
                                OnlineCVDetailResponse.from(cv), "CV đã được archive."));
        }

        // ── POST /api/v1/cv/{cvId}/restore ───────────────────────────────

        @Operation(summary = "Restore CV từ ARCHIVED → DRAFT")
        @PostMapping("/{cvId}/restore")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_RESTORE_CV", resourceType = "OnlineCV")
        public ResponseEntity<ApiResponse<OnlineCVDetailResponse>> restoreCV(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId) {
                OnlineCV cv = restoreUseCase.execute(cvId, candidateId);
                return ResponseEntity.ok(ApiResponse.success(
                                OnlineCVDetailResponse.from(cv), "CV đã được restore về DRAFT."));
        }

        // ── POST /api/v1/cv/{cvId}/duplicate ─────────────────────────────

        @Operation(summary = "Nhân bản CV")
        @PostMapping("/{cvId}/duplicate")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_DUPLICATE_CV", resourceType = "OnlineCV")
        public ResponseEntity<ApiResponse<OnlineCVDetailResponse>> duplicateCV(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId) {
                OnlineCV cv = duplicateUseCase.execute(cvId, candidateId);
                return ResponseEntity.ok(ApiResponse.success(
                                OnlineCVDetailResponse.from(cv), "CV đã được nhân bản."));
        }

        // ── POST /api/v1/cv/{cvId}/export ────────────────────────────────

        @Operation(summary = "Xuất CV thành PDF", description = """
                        Export CV ra PDF — **miễn phí cho tất cả gói**.
                        Lần đầu: render + upload S3. Lần sau: tải từ cache S3.
                        """)
        @PostMapping("/{cvId}/export")
        @RateLimit(policy = "cv-export", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "CANDIDATE_EXPORT_CV_PDF", resourceType = "OnlineCV")
        public ResponseEntity<InputStreamResource> exportCV(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId,
                        @RequestParam(defaultValue = "attachment") String disposition) {
                ExportCVUseCase.Result result = exportUseCase.execute(cvId, candidateId);
                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                disposition + "; filename=\"" + result.fileName() + "\"")
                                .contentType(MediaType.APPLICATION_PDF)
                                .contentLength(result.pdfBytes().length)
                                .body(new InputStreamResource(
                                                new java.io.ByteArrayInputStream(result.pdfBytes())));
        }

        // ── POST /api/v1/cv/{cvId}/ai-optimize ───────────────────────────

        /**
         * AI tối ưu CV theo JD — chỉ dành cho gói PREMIUM.
         *
         * Không tự động sửa CV — chỉ trả về gợi ý để candidate review.
         * Candidate tự áp dụng gợi ý vào từng section qua PUT /sections/{id}.
         *
         * Response gồm:
         * - overallSummary : nhận xét tổng thể + matchScore (0-100)
         * - suggestedSummary : đề xuất viết lại phần tóm tắt
         * - skillsToAdd : kỹ năng nên thêm vào
         * - skillsToRemove : kỹ năng không liên quan JD này
         * - experienceSuggestions: cách viết lại mục kinh nghiệm
         * - missingKeywords : từ khóa quan trọng trong JD mà CV đang thiếu
         * - matchScore : điểm phù hợp tổng thể (0-100)
         *
         * Error codes:
         * - AI_CV_WRITER_NOT_AVAILABLE : không có gói PREMIUM
         */
        @Operation(summary = "AI tối ưu CV theo JD ⭐ PREMIUM", description = """
                        Phân tích CV của bạn so với một tin tuyển dụng cụ thể.
                        AI sẽ gợi ý cách tối ưu nội dung để tăng tỷ lệ được nhà tuyển dụng chú ý.

                        **Yêu cầu:** Gói **PREMIUM**.

                        Kết quả chỉ là gợi ý — bạn tự quyết định áp dụng hay không.
                        """)
        @PostMapping("/{cvId}/ai-optimize")
        @RateLimit(policy = "ai-heavy", scope = RateLimitPolicy.Scope.USER) // tái dùng policy đã có
        @Loggable(action = "CANDIDATE_AI_OPTIMIZE_CV", resourceType = "OnlineCV")
        public ResponseEntity<ApiResponse<CvOptimizationResult>> aiOptimize(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId,
                        @RequestParam UUID jobPostId) {

                CvOptimizationResult result = aiOptimizeCVUseCase.execute(
                                new AiOptimizeCVUseCase.Command(cvId, jobPostId, candidateId));

                return ResponseEntity.ok(ApiResponse.success(result,
                                "Phân tích hoàn tất. Xem gợi ý bên dưới để tối ưu CV của bạn."));
        }

        // ── POST /api/v1/cv/{cvId}/import-from-profile ───────────────────

        @Operation(summary = "Import từ hồ sơ ứng viên")
        @PostMapping("/{cvId}/import-from-profile")
        @RateLimit(policy = "candidate-write", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<OnlineCVDetailResponse>> importFromProfile(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId) {
                OnlineCV cv = importFromProfileUseCase.execute(cvId, candidateId);
                return ResponseEntity.ok(ApiResponse.success(
                                OnlineCVDetailResponse.from(cv), "Dữ liệu hồ sơ đã được import vào CV."));
        }

        // ── GET /api/v1/cv/{cvId}/preview-html ───────────────────────────

        @Operation(summary = "Preview CV dưới dạng HTML")
        @GetMapping("/{cvId}/preview-html")
        @RateLimit(policy = "candidate-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<String>> previewHTML(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId) {
                String renderedHtml = previewCVUseCase.execute(cvId, candidateId);
                return ResponseEntity.ok(ApiResponse.success(renderedHtml, "Thành công"));
        }

        // ── GET /api/v1/cv/{cvId}/view ────────────────────────────────────

        @Operation(summary = "Xem CV PDF (inline)")
        @GetMapping("/{cvId}/view")
        @RateLimit(policy = "cv-stream", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<InputStreamResource> viewCV(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId) {
                DownloadExportedCVUseCase.Result result = downloadExportedCVUseCase.execute(candidateId, cvId);
                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "inline; filename=\"" + result.fileName() + "\"")
                                .contentType(MediaType.parseMediaType(result.contentType()))
                                .contentLength(result.contentLength())
                                .body(new InputStreamResource(result.inputStream()));
        }

        // ── Helpers ───────────────────────────────────────────────────────

        private PersonalInfo buildPersonalInfo(PersonalInfoRequest req) {
                if (req == null)
                        return null;
                return PersonalInfo.builder()
                                .fullName(req.getFullName())
                                .email(req.getEmail())
                                .phone(req.getPhone())
                                .address(req.getAddress())
                                .avatarUrl(req.getAvatarUrl())
                                .headline(req.getHeadline())
                                .linkedIn(req.getLinkedIn())
                                .github(req.getGithub())
                                .website(req.getWebsite())
                                .build();
        }
}