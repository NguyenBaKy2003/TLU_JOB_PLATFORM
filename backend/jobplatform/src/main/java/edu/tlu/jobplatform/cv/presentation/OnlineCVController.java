package edu.tlu.jobplatform.cv.presentation;

import edu.tlu.jobplatform.cv.application.usecase.*;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.model.vo.PersonalInfo;
import edu.tlu.jobplatform.cv.presentation.dto.request.*;
import edu.tlu.jobplatform.cv.presentation.dto.response.*;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

        // ── GET /api/v1/cv ────────────────────────────────────────────────────────

        @Operation(summary = "Danh sách CV của tôi")
        @GetMapping
        public ResponseEntity<ApiResponse<List<OnlineCVResponse>>> listMyCVs(
                        @CurrentUser UUID candidateId) {

                List<OnlineCVResponse> list = getMyCVsUseCase.execute(candidateId)
                                .stream().map(OnlineCVResponse::from).toList();
                return ResponseEntity.ok(ApiResponse.success(list));
        }

        // ── POST /api/v1/cv ───────────────────────────────────────────────────────

        @Operation(summary = "Tạo CV mới", description = """
                        Tạo CV mới ở trạng thái DRAFT từ template được chọn.
                        Tối đa **10 CV** mỗi tài khoản.
                        """)
        @PostMapping
        public ResponseEntity<ApiResponse<OnlineCVDetailResponse>> createCV(
                        @CurrentUser UUID candidateId,
                        @Valid @RequestBody CreateOnlineCVRequest req) {

                OnlineCV cv = createUseCase.execute(new CreateOnlineCVUseCase.Command(
                                candidateId, req.getTitle(), req.getTemplateId()));
                return ResponseEntity.ok(ApiResponse.success(
                                OnlineCVDetailResponse.from(cv), "CV đã được tạo thành công."));
        }

        // ── GET /api/v1/cv/{cvId} ─────────────────────────────────────────────────

        @Operation(summary = "Chi tiết CV (để chỉnh sửa)")
        @GetMapping("/{cvId}")
        public ResponseEntity<ApiResponse<OnlineCVDetailResponse>> getCVDetail(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId) {

                OnlineCV cv = getCVDetailUseCase.execute(cvId, candidateId);
                return ResponseEntity.ok(ApiResponse.success(OnlineCVDetailResponse.from(cv)));
        }

        // ── PUT /api/v1/cv/{cvId} ─────────────────────────────────────────────────

        @Operation(summary = "Cập nhật metadata CV", description = """
                        Cập nhật: tiêu đề, thông tin cá nhân, template, visibility.
                        Không ảnh hưởng đến nội dung sections.
                        """)
        @PutMapping("/{cvId}")
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

        // ── DELETE /api/v1/cv/{cvId} ──────────────────────────────────────────────

        @Operation(summary = "Xóa CV", description = "Xóa hoàn toàn CV và file PDF trên S3 (nếu có).")
        @DeleteMapping("/{cvId}")
        public ResponseEntity<ApiResponse<Void>> deleteCV(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId) {

                deleteUseCase.execute(cvId, candidateId);
                return ResponseEntity.ok(ApiResponse.success("CV đã được xóa."));
        }

        // ── POST /api/v1/cv/{cvId}/sections ───────────────────────────────────────

        @Operation(summary = "Thêm section mới vào CV")
        @PostMapping("/{cvId}/sections")
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

        // ── PUT /api/v1/cv/{cvId}/sections/{sectionId} ────────────────────────────

        @Operation(summary = "Cập nhật nội dung section")
        @PutMapping("/{cvId}/sections/{sectionId}")
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

        // ── DELETE /api/v1/cv/{cvId}/sections/{sectionId} ─────────────────────────

        @Operation(summary = "Xóa section khỏi CV")
        @DeleteMapping("/{cvId}/sections/{sectionId}")
        public ResponseEntity<ApiResponse<Void>> deleteSection(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId,
                        @PathVariable UUID sectionId) {

                deleteSectionUseCase.execute(cvId, candidateId, sectionId);
                return ResponseEntity.ok(ApiResponse.success("Section đã được xóa."));
        }

        // ── PATCH /api/v1/cv/{cvId}/sections/reorder ──────────────────────────────

        @Operation(summary = "Sắp xếp lại thứ tự sections", description = """
                        Truyền vào mảng sectionIds theo thứ tự mới.
                        Phải chứa đủ tất cả section IDs hiện có.
                        """)
        @PatchMapping("/{cvId}/sections/reorder")
        public ResponseEntity<ApiResponse<OnlineCVDetailResponse>> reorderSections(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId,
                        @Valid @RequestBody ReorderSectionsRequest req) {

                OnlineCV cv = reorderUseCase.execute(new ReorderSectionsUseCase.Command(
                                cvId, candidateId, req.getSectionIds()));
                return ResponseEntity.ok(ApiResponse.success(
                                OnlineCVDetailResponse.from(cv), "Thứ tự sections đã được cập nhật."));
        }

        // ── POST /api/v1/cv/{cvId}/publish ────────────────────────────────────────

        @Operation(summary = "Publish CV", description = """
                        Chuyển CV từ DRAFT → PUBLISHED.
                        Yêu cầu: họ tên, email và ít nhất 1 section hiển thị.
                        Sau khi publish, CV có thể truy cập qua `/public/cv/{slug}`.
                        """)
        @PostMapping("/{cvId}/publish")
        public ResponseEntity<ApiResponse<OnlineCVDetailResponse>> publishCV(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId) {

                OnlineCV cv = publishUseCase.execute(cvId, candidateId);
                return ResponseEntity.ok(ApiResponse.success(
                                OnlineCVDetailResponse.from(cv),
                                "CV đã được publish. Slug: " + cv.getSlug()));
        }

        // ── POST /api/v1/cv/{cvId}/archive ────────────────────────────────────────

        @Operation(summary = "Archive CV")
        @PostMapping("/{cvId}/archive")
        public ResponseEntity<ApiResponse<OnlineCVDetailResponse>> archiveCV(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId) {

                OnlineCV cv = archiveUseCase.execute(cvId, candidateId);
                return ResponseEntity.ok(ApiResponse.success(
                                OnlineCVDetailResponse.from(cv), "CV đã được archive."));
        }

        // ── POST /api/v1/cv/{cvId}/restore ────────────────────────────────────────

        @Operation(summary = "Restore CV từ ARCHIVED → DRAFT")
        @PostMapping("/{cvId}/restore")
        public ResponseEntity<ApiResponse<OnlineCVDetailResponse>> restoreCV(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId) {

                OnlineCV cv = restoreUseCase.execute(cvId, candidateId);
                return ResponseEntity.ok(ApiResponse.success(
                                OnlineCVDetailResponse.from(cv), "CV đã được restore về DRAFT."));
        }

        // ── POST /api/v1/cv/{cvId}/duplicate ──────────────────────────────────────

        @Operation(summary = "Nhân bản CV", description = "Clone CV hiện tại thành bản DRAFT mới.")
        @PostMapping("/{cvId}/duplicate")
        public ResponseEntity<ApiResponse<OnlineCVDetailResponse>> duplicateCV(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId) {

                OnlineCV cv = duplicateUseCase.execute(cvId, candidateId);
                return ResponseEntity.ok(ApiResponse.success(
                                OnlineCVDetailResponse.from(cv), "CV đã được nhân bản."));
        }

        // ── POST /api/v1/cv/{cvId}/export ─────────────────────────────────────────

        @Operation(summary = "Xuất CV thành PDF", description = """
                        Render CV theo template đã chọn → PDF.
                        Trả về URL tải PDF.
                        Có thể export cả DRAFT (để preview) lẫn PUBLISHED.
                        """)
        @PostMapping("/{cvId}/export")
        public ResponseEntity<ApiResponse<String>> exportCV(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId) {

                ExportCVUseCase.Result result = exportUseCase.execute(cvId, candidateId);
                return ResponseEntity.ok(ApiResponse.success(
                                result.pdfUrl(), "PDF đã sẵn sàng: " + result.fileName()));
        }

        // ── POST /api/v1/cv/{cvId}/import-from-profile ────────────────────────────

        @Operation(summary = "Import từ hồ sơ ứng viên", description = """
                        Tự động điền thông tin cá nhân, kinh nghiệm, học vấn, kỹ năng
                        từ CandidateProfile vào CV này.
                        Dữ liệu hiện có sẽ bị ghi đè.
                        """)
        @PostMapping("/{cvId}/import-from-profile")
        public ResponseEntity<ApiResponse<OnlineCVDetailResponse>> importFromProfile(
                        @CurrentUser UUID candidateId,
                        @PathVariable UUID cvId) {

                OnlineCV cv = importFromProfileUseCase.execute(cvId, candidateId);
                return ResponseEntity.ok(ApiResponse.success(
                                OnlineCVDetailResponse.from(cv), "Dữ liệu hồ sơ đã được import vào CV."));
        }

        // ── Helpers ───────────────────────────────────────────────────────────────

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