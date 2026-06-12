package edu.tlu.jobplatform.cv.presentation;

import edu.tlu.jobplatform.auditlog.domain.annotation.Loggable;
import edu.tlu.jobplatform.cv.application.usecase.admin.*;
import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.presentation.dto.request.CreateCVTemplateRequest;
import edu.tlu.jobplatform.cv.presentation.dto.request.UpdateCVTemplateRequest;
import edu.tlu.jobplatform.cv.presentation.dto.response.AdminCVTemplateResponse;
import edu.tlu.jobplatform.ratelimit.domain.model.RateLimitPolicy;
import edu.tlu.jobplatform.ratelimit.presentation.annotation.RateLimit;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * Admin quản lý CV templates — tạo, sửa, bật/tắt.
 * Không cần sửa code hay redeploy khi thêm template mới.
 *
 * Endpoints:
 * GET /api/v1/admin/cv-templates — danh sách tất cả (kể cả inactive)
 * GET /api/v1/admin/cv-templates/{id} — chi tiết kèm htmlContent
 * POST /api/v1/admin/cv-templates — tạo template mới
 * PUT /api/v1/admin/cv-templates/{id} — cập nhật template
 * PATCH /api/v1/admin/cv-templates/{id}/activate — bật template
 * PATCH /api/v1/admin/cv-templates/{id}/deactivate — tắt template
 */

@RestController
@RequestMapping("/api/v1/admin/cv-templates")
@RequiredArgsConstructor
@Tag(name = "Admin - CV Templates", description = "Quản lý template CV (Admin only)")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCVTemplateController {

        private final GetAllCVTemplatesUseCase getAllUseCase;
        private final CreateCVTemplateUseCase createUseCase;
        private final UpdateCVTemplateUseCase updateUseCase;
        private final ToggleCVTemplateUseCase toggleUseCase;
        private final GetCVTemplateDetailUseCase getDetailUseCase;
        private final UploadCVTemplateThumbnailUseCase uploadThumbnailUseCase;

        // ── GET /api/v1/admin/cv-templates ─

        @Operation(summary = "Danh sách tất cả templates (kể cả inactive)")
        @GetMapping
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<List<AdminCVTemplateResponse>>> listAll() {
                List<AdminCVTemplateResponse> list = getAllUseCase.execute()
                                .stream().map(AdminCVTemplateResponse::fromList).toList();
                return ResponseEntity.ok(ApiResponse.success(list));
        }

        // ── POST /api/v1/admin/cv-templates

        @Operation(summary = "Tạo template mới", description = """
                        Upload HTML content để tạo template CV mới.
                        HTML phải là **XHTML hợp lệ** (strict XML).

                        **Biến Thymeleaf có sẵn trong HTML:**
                        - `${personalInfo}` — họ tên, email, phone, address, avatarUrl, headline, linkedIn, github, website
                        - `${sections}` — `List<CVSection>` (visible, sorted by displayOrder)
                        - `${sectionsByType}` — `Map<String, List<CVSection>>` key = SectionType.name()
                        - `${cv}` — OnlineCV aggregate (title, viewCount, ...)

                        **SectionType values:** `SUMMARY`, `EXPERIENCE`, `EDUCATION`, `SKILL`,
                        `PROJECT`, `CERTIFICATE`, `LANGUAGE`, `AWARD`, `CUSTOM`

                        **Ví dụ HTML tối giản:**
                        ```xml
                        <?xml version="1.0" encoding="UTF-8"?>
                        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
                            "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
                        <html xmlns="http://www.w3.org/1999/xhtml"
                              xmlns:th="http://www.thymeleaf.org">
                        <head><title th:text="${cv.title}">CV</title></head>
                        <body>
                          <h1 th:text="${personalInfo.fullName}">Name</h1>
                          <div th:each="section : ${sections}">
                            <h2 th:text="${section.title}">Section</h2>
                            <div th:utext="${section.content}"/>
                          </div>
                        </body>
                        </html>
                        ```
                        """)
        @PostMapping
        @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_CREATE_CV_TEMPLATE", resourceType = "CVTemplate")
        public ResponseEntity<ApiResponse<AdminCVTemplateResponse>> create(
                        @Valid @RequestBody CreateCVTemplateRequest req) {

                CVTemplate template = createUseCase.execute(new CreateCVTemplateUseCase.Command(
                                req.getName(), req.getThumbnailUrl(), req.getCategory(),
                                req.isPremium(), req.getHtmlContent()));

                return ResponseEntity.ok(ApiResponse.success(
                                AdminCVTemplateResponse.from(template),
                                "Template đã được tạo thành công."));
        }

        // ── PUT /api/v1/admin/cv-templates/{id}

        @Operation(summary = "Cập nhật template", description = """
                        Cập nhật toàn bộ thông tin và HTML content của template.
                        Các CV đang dùng template này sẽ tự động dùng HTML mới khi export lần tiếp.
                        """)
        @PutMapping("/{templateId}")
        @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_UPDATE_CV_TEMPLATE", resourceType = "CVTemplate")
        public ResponseEntity<ApiResponse<AdminCVTemplateResponse>> update(
                        @PathVariable UUID templateId,
                        @Valid @RequestBody UpdateCVTemplateRequest req) {

                CVTemplate template = updateUseCase.execute(new UpdateCVTemplateUseCase.Command(
                                templateId, req.getName(), req.getThumbnailUrl(), req.getCategory(),
                                req.isPremium(), req.getHtmlContent(), req.isActive()));

                return ResponseEntity.ok(ApiResponse.success(
                                AdminCVTemplateResponse.from(template),
                                "Template đã được cập nhật."));
        }

        // ── PATCH /api/v1/admin/cv-templates/{id}/activate

        @Operation(summary = "Kích hoạt template", description = """
                        Template được activate sẽ hiển thị trong danh sách candidate chọn.
                        """)
        @PatchMapping("/{templateId}/activate")
        @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_ACTIVATE_CV_TEMPLATE", resourceType = "CVTemplate")
        public ResponseEntity<ApiResponse<AdminCVTemplateResponse>> activate(
                        @PathVariable UUID templateId) {

                CVTemplate template = toggleUseCase.execute(templateId, true);
                return ResponseEntity.ok(ApiResponse.success(
                                AdminCVTemplateResponse.fromList(template),
                                "Template đã được kích hoạt."));
        }

        // ── PATCH /api/v1/admin/cv-templates/{id}/deactivate

        @Operation(summary = "Ẩn template", description = """
                        Template bị deactivate sẽ ẩn khỏi danh sách candidate.
                        Các CV đã tạo từ template này vẫn render bình thường.
                        """)
        @PatchMapping("/{templateId}/deactivate")
        @RateLimit(policy = "admin-write", scope = RateLimitPolicy.Scope.USER)
        @Loggable(action = "ADMIN_DEACTIVATE_CV_TEMPLATE", resourceType = "CVTemplate")
        public ResponseEntity<ApiResponse<AdminCVTemplateResponse>> deactivate(
                        @PathVariable UUID templateId) {

                CVTemplate template = toggleUseCase.execute(templateId, false);
                return ResponseEntity.ok(ApiResponse.success(
                                AdminCVTemplateResponse.fromList(template),
                                "Template đã được ẩn."));
        }

        // ── GET /api/v1/admin/cv-templates/{id}

        @Operation(summary = "Chi tiết template (kèm htmlContent)")
        @GetMapping("/{templateId}")
        @RateLimit(policy = "admin-read", scope = RateLimitPolicy.Scope.USER)
        public ResponseEntity<ApiResponse<AdminCVTemplateResponse>> getDetail(
                        @PathVariable UUID templateId) {

                CVTemplate template = getDetailUseCase.execute(templateId);
                return ResponseEntity.ok(ApiResponse.success(
                                AdminCVTemplateResponse.from(template)));
        }

        @Operation(summary = "Upload thumbnail cho template")
        @PatchMapping("/{templateId}/thumbnail")
        @Loggable(action = "ADMIN_UPLOAD_CV_TEMPLATE_THUMBNAIL", resourceType = "CVTemplate")
        public ResponseEntity<ApiResponse<AdminCVTemplateResponse>> uploadThumbnail(
                        @PathVariable UUID templateId,
                        @RequestParam("file") MultipartFile file) {

                CVTemplate template = uploadThumbnailUseCase.execute(templateId, file);
                return ResponseEntity.ok(ApiResponse.success(
                                AdminCVTemplateResponse.fromList(template),
                                "Thumbnail đã được cập nhật."));
        }
}