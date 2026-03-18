package edu.tlu.jobplatform.candidate.presentation;

import edu.tlu.jobplatform.candidate.application.usecase.cv.*;
import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.candidate.presentation.dto.request.CreateOnlineCVRequest;
import edu.tlu.jobplatform.candidate.presentation.dto.request.CVUploadRequest;
import edu.tlu.jobplatform.candidate.presentation.dto.response.CVResponse;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateCVRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import edu.tlu.jobplatform.shared.security.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Encoding;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/candidate/cv")
@RequiredArgsConstructor
@Tag(name = "Candidate - CV", description = "Quản lý CV ứng viên")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('CANDIDATE')")
public class CandidateCVController {

        private final UploadCVUseCase uploadCVUseCase;
        private final CreateOnlineCVUseCase createOnlineCVUseCase;
        private final SetPrimaryCVUseCase setPrimaryCVUseCase;
        private final DeleteCVUseCase deleteCVUseCase;
        private final CandidateCVRepository cvRepository;

        // ── GET /api/v1/candidate/cv ──────────────────────────────────

        @Operation(summary = "Danh sách CV của tôi")
        @GetMapping
        public ResponseEntity<ApiResponse<List<CVResponse>>> listMyCVs(
                        @CurrentUser UUID userId) {

                List<CVResponse> cvs = cvRepository.findAllByCandidateId(userId)
                                .stream().map(CVResponse::from).toList();

                return ResponseEntity.ok(ApiResponse.success(cvs));
        }

        // ── POST /api/v1/candidate/cv/upload ─────────────────────────

        @Operation(summary = "Upload CV (PDF / DOC / DOCX)", description = """
                        Upload file CV lên S3.
                        - Tối đa **5 CV** mỗi tài khoản
                        - Định dạng: PDF, DOC, DOCX
                        - Dung lượng tối đa: **10 MB**
                        - CV đầu tiên tự động là **primary**
                        """)
        @RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE, encoding = @Encoding(name = "data", contentType = "application/json")))
        @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ApiResponse<CVResponse>> uploadCV(
                        @CurrentUser UUID userId,
                        @RequestPart("file") MultipartFile file,
                        @RequestPart(value = "data", required = false) @Valid CVUploadRequest data) {

                // Nếu data null (client không gửi) thì dùng tên file làm title
                String title = (data != null && data.getTitle() != null)
                                ? data.getTitle()
                                : file.getOriginalFilename();

                validateFile(file);

                UploadCVUseCase.Command cmd;
                try {
                        cmd = new UploadCVUseCase.Command(
                                        userId,
                                        title,
                                        file.getOriginalFilename(),
                                        file.getContentType(),
                                        file.getSize(),
                                        file.getInputStream());
                } catch (IOException e) {
                        throw new BusinessRuleException(
                                        "Không thể đọc file. Vui lòng thử lại.", "FILE_READ_ERROR");
                }

                CandidateCV cv = uploadCVUseCase.execute(cmd);
                return ResponseEntity.ok(ApiResponse.success(
                                CVResponse.from(cv), "CV đã được tải lên thành công."));
        }

        // ── POST /api/v1/candidate/cv/online ─────────────────────────

        @Operation(summary = "Tạo CV online", description = """
                        Tạo CV trực tiếp trên hệ thống (không cần upload file).
                        Nội dung có thể là plain text hoặc HTML.
                        """)
        @PostMapping("/online")
        public ResponseEntity<ApiResponse<CVResponse>> createOnlineCV(
                        @CurrentUser UUID userId,
                        @Valid @RequestBody CreateOnlineCVRequest req) {

                CandidateCV cv = createOnlineCVUseCase.execute(
                                new CreateOnlineCVUseCase.Command(
                                                userId, req.getTitle(), req.getContent()));

                return ResponseEntity.ok(ApiResponse.success(
                                CVResponse.from(cv), "CV đã được tạo thành công."));
        }

        // ── PATCH /api/v1/candidate/cv/{cvId}/primary ─────────────────

        @Operation(summary = "Đặt CV làm primary", description = """
                        CV primary là CV mặc định khi ứng tuyển.
                        Chỉ có 1 CV primary tại một thời điểm.
                        """)
        @PatchMapping("/{cvId}/primary")
        public ResponseEntity<ApiResponse<Void>> setPrimary(
                        @CurrentUser UUID userId,
                        @PathVariable UUID cvId) {

                setPrimaryCVUseCase.execute(userId, cvId);
                return ResponseEntity.ok(ApiResponse.success("CV primary đã được cập nhật."));
        }

        // ── DELETE /api/v1/candidate/cv/{cvId} ────────────────────────

        @Operation(summary = "Xóa CV", description = """
                        Xóa CV và file trên S3 (nếu là UPLOADED).
                        Nếu xóa CV primary → CV mới nhất tự động trở thành primary.
                        """)
        @DeleteMapping("/{cvId}")
        public ResponseEntity<ApiResponse<Void>> deleteCV(
                        @CurrentUser UUID userId,
                        @PathVariable UUID cvId) {

                deleteCVUseCase.execute(userId, cvId);
                return ResponseEntity.ok(ApiResponse.success("CV đã được xóa."));
        }

        // ── Helper ────────────────────────────────────────────────────

        private static final long MAX_FILE_SIZE = 10L * 1024 * 1024; // 10 MB
        private static final List<String> ALLOWED_TYPES = List.of(
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

        private void validateFile(MultipartFile file) {
                if (file.isEmpty()) {
                        throw new BusinessRuleException(
                                        "File không được để trống.", "FILE_EMPTY");
                }
                if (file.getSize() > MAX_FILE_SIZE) {
                        throw new BusinessRuleException(
                                        "File vượt quá dung lượng tối đa 10MB.", "FILE_TOO_LARGE");
                }
                if (!ALLOWED_TYPES.contains(file.getContentType())) {
                        throw new BusinessRuleException(
                                        "Chỉ chấp nhận PDF, DOC, DOCX.", "INVALID_FILE_TYPE");
                }
        }
}
