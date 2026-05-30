package edu.tlu.jobplatform.candidate.presentation;

import edu.tlu.jobplatform.candidate.application.usecase.cv.*;
import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.candidate.presentation.dto.request.CVUploadRequest;
import edu.tlu.jobplatform.candidate.presentation.dto.response.CVResponse;
import edu.tlu.jobplatform.candidate.presentation.dto.response.UnifiedCVResponse;
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
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/v1/candidate/cv")
@RequiredArgsConstructor
@Tag(name = "Candidate - CV", description = "Quản lý CV ứng viên")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('CANDIDATE')")
public class CandidateCVController {

        private final UploadCVUseCase uploadCVUseCase;
        private final SetPrimaryCVUseCase setPrimaryCVUseCase;
        private final DeleteCVUseCase deleteCVUseCase;
        private final DownloadCVUseCase downloadCVUseCase;
        private final ListAllCVsUseCase listAllCVsUseCase;
        private final ListApplicableCVsUseCase listApplicableCVsUseCase;
        // ── GET /api/v1/candidate/cv ──

        @Operation(summary = "Danh sách tất cả CV (uploaded + online)")
        @GetMapping
        public ResponseEntity<ApiResponse<List<UnifiedCVResponse>>> listMyCVs(
                        @CurrentUser UUID userId) {

                ListAllCVsUseCase.Result result = listAllCVsUseCase.execute(userId);

                List<UnifiedCVResponse> response = Stream.concat(
                                result.uploadedCVs().stream().map(UnifiedCVResponse::fromUploaded),
                                result.onlineCVs().stream().map(UnifiedCVResponse::fromOnline))
                                .sorted(Comparator.comparing(
                                                UnifiedCVResponse::getCreatedAt,
                                                Comparator.nullsLast(Comparator.reverseOrder())))
                                .toList();

                return ResponseEntity.ok(ApiResponse.success(response));
        }

        // ── POST /api/v1/candidate/cv/upload ──
        @Operation(summary = "CV có thể dùng để nộp đơn (uploaded + online PUBLISHED)")
        @GetMapping("/applicable")
        public ResponseEntity<ApiResponse<List<ListApplicableCVsUseCase.ApplicableCV>>> listApplicableCVs(
                        @CurrentUser UUID userId) {

                return ResponseEntity.ok(ApiResponse.success(
                                listApplicableCVsUseCase.execute(userId)));
        }

        @Operation(summary = "Upload CV (PDF / DOC / DOCX)", description = """
                        Upload file CV lên S3.
                        - Tối đa **5 CV** mỗi tài khoản
                        - Định dạng: PDF, DOC, DOCX
                        - Dung lượng tối đa: **10 MB**
                        - CV đầu tiên tự động là **primary**
                        - Gửi `setAsPrimary: true` trong phần `data` để đặt làm primary ngay
                        """)
        @RequestBody(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE, encoding = @Encoding(name = "data", contentType = "application/json")))
        @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ApiResponse<CVResponse>> uploadCV(
                        @CurrentUser UUID userId,
                        @RequestPart("file") MultipartFile file,
                        @RequestPart(value = "data", required = false) @Valid CVUploadRequest data) {

                validateFile(file);

                // Lấy title và setAsPrimary từ data (nếu có)
                String title = (data != null && data.getTitle() != null)
                                ? data.getTitle()
                                : file.getOriginalFilename();
                Boolean setAsPrimary = (data != null) ? data.getSetAsPrimary() : null;

                UploadCVUseCase.Command cmd;
                try {
                        cmd = new UploadCVUseCase.Command(
                                        userId,
                                        title,
                                        file.getOriginalFilename(),
                                        file.getContentType(),
                                        file.getSize(),
                                        file.getInputStream(),
                                        setAsPrimary); // ← tham số thứ 7
                } catch (IOException e) {
                        throw new BusinessRuleException(
                                        "Không thể đọc file. Vui lòng thử lại.", "FILE_READ_ERROR");
                }

                CandidateCV cv = uploadCVUseCase.execute(cmd);
                return ResponseEntity.ok(ApiResponse.success(
                                CVResponse.from(cv), "CV đã được tải lên thành công."));
        }

        // ── GET /api/v1/candidate/cv/{cvId}/view ──

        @Operation(summary = "Xem CV (inline)", description = """
                        Trả về file stream với Content-Disposition: inline.
                        Browser sẽ hiển thị PDF trực tiếp trong tab mới thay vì tải xuống.
                        """)
        @GetMapping("/{cvId}/view")
        public ResponseEntity<InputStreamResource> viewCV(
                        @CurrentUser UUID userId,
                        @PathVariable UUID cvId) {

                DownloadCVUseCase.Result result = downloadCVUseCase.execute(userId, cvId);

                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "inline; filename=\"" + result.fileName() + "\"")
                                .contentType(MediaType.parseMediaType(result.contentType()))
                                .contentLength(result.contentLength())
                                .body(new InputStreamResource(result.inputStream()));
        }

        // ── GET /api/v1/candidate/cv/{cvId}/download

        @Operation(summary = "Tải CV xuống", description = """
                        Trả về file stream với Content-Disposition: attachment.
                        Browser sẽ tự động tải file xuống máy.
                        """)
        @GetMapping("/{cvId}/download")
        public ResponseEntity<InputStreamResource> downloadCV(
                        @CurrentUser UUID userId,
                        @PathVariable UUID cvId) {

                DownloadCVUseCase.Result result = downloadCVUseCase.execute(userId, cvId);

                return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=\"" + result.fileName() + "\"")
                                .contentType(MediaType.parseMediaType(result.contentType()))
                                .contentLength(result.contentLength())
                                .body(new InputStreamResource(result.inputStream()));
        }

        // ── PATCH /api/v1/candidate/cv/{cvId}/primary ──

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

        // ── DELETE /api/v1/candidate/cv/{cvId}

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

        // ── Validation helper ─

        private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;
        private static final List<String> ALLOWED_TYPES = List.of(
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

        private void validateFile(MultipartFile file) {
                if (file.isEmpty())
                        throw new BusinessRuleException("File không được để trống.", "FILE_EMPTY");
                if (file.getSize() > MAX_FILE_SIZE)
                        throw new BusinessRuleException("File vượt quá dung lượng tối đa 10MB.", "FILE_TOO_LARGE");
                if (!ALLOWED_TYPES.contains(file.getContentType()))
                        throw new BusinessRuleException("Chỉ chấp nhận PDF, DOC, DOCX.", "INVALID_FILE_TYPE");
        }
}