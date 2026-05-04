package edu.tlu.jobplatform.shared.exception;

import edu.tlu.jobplatform.shared.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Xử lý tập trung mọi exception trong toàn bộ ứng dụng.
 *
 * Controller không cần try-catch — chỉ cần throw exception phù hợp.
 * Handler này bắt và format thành ApiResponse chuẩn.
 *
 * Thứ tự ưu tiên: specific → general (DomainException trước Exception)
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── Domain Exceptions ──────────────────────────────────────────

    /**
     * Bắt tất cả DomainException và subclass:
     * ResourceNotFoundException, BusinessRuleException, QuotaExceededException...
     */
    @ExceptionHandler(DomainException.class)
    public ResponseEntity<ApiResponse<Void>> handleDomainException(DomainException ex) {
        log.warn("Domain exception [{}]: {}", ex.getErrorCode(), ex.getMessage());
        return ResponseEntity
                .status(ex.getHttpStatus())
                .body(ApiResponse.error(ex.getMessage(), ex.getErrorCode(), traceId()));
    }

    // ── Validation Exceptions ──────────────────────────────────────

    /**
     * Lỗi @Valid trên @RequestBody — trả về map field → message.
     *
     * Response:
     * 
     * <pre>
     * {
     *   "success"  : false,
     *   "errorCode": "VALIDATION_ERROR",
     *   "data"     : { "email": "Không đúng định dạng", "password": "Tối thiểu 8 ký tự" }
     * }
     * </pre>
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new LinkedHashMap<>();
        for (var error : ex.getBindingResult().getAllErrors()) {
            String field = ((FieldError) error).getField();
            String message = error.getDefaultMessage();
            errors.put(field, message);
        }

        log.debug("Validation errors: {}", errors);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.errorWithData(errors, "Dữ liệu không hợp lệ", "VALIDATION_ERROR"));
    }

    /**
     * Lỗi @Validated trên @PathVariable, @RequestParam.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(
            ConstraintViolationException ex) {

        String message = ex.getConstraintViolations().stream()
                .map(cv -> cv.getPropertyPath() + ": " + cv.getMessage())
                .findFirst()
                .orElse("Dữ liệu không hợp lệ");

        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(message, "VALIDATION_ERROR", traceId()));
    }

    // ── Spring Security Exceptions ─────────────────────────────────

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(
                        "Bạn không có quyền thực hiện thao tác này", "FORBIDDEN", traceId()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(
                        "Email hoặc mật khẩu không đúng", "INVALID_CREDENTIALS", traceId()));
    }

    // ── HTTP Exceptions

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotReadable(
            HttpMessageNotReadableException ex) {
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(
                        "Request body không hợp lệ hoặc bị thiếu", "INVALID_BODY", traceId()));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParam(
            MissingServletRequestParameterException ex) {
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(
                        "Thiếu tham số bắt buộc: " + ex.getParameterName(), "MISSING_PARAM", traceId()));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex) {
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(
                        "Tham số '" + ex.getName() + "' không đúng kiểu dữ liệu",
                        "TYPE_MISMATCH", traceId()));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleFileTooLarge(
            MaxUploadSizeExceededException ex) {
        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiResponse.error(
                        "File quá lớn. Kích thước tối đa cho phép là 10MB", "FILE_TOO_LARGE", traceId()));
    }

    // ── Fallback ───────

    /**
     * Bắt mọi exception chưa được handle.
     * Log đầy đủ stack trace, nhưng KHÔNG trả chi tiết cho client.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception ex) {
        String tid = traceId();
        log.error("Unexpected error [traceId={}]: {}", tid, ex.getMessage(), ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(
                        "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
                        "INTERNAL_ERROR", tid));
    }

    // ── Helper ────────

    private String traceId() {
        String id = MDC.get("traceId");
        return id != null ? id : "N/A";
    }
}
