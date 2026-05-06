package edu.tlu.jobplatform.shared.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Wrapper chuẩn cho mọi HTTP response trong hệ thống.
 *
 * Mọi API đều trả về đúng format này — frontend xử lý 1 pattern duy nhất:
 * 
 * <pre>
 * {
 *   "success"  : true,
 *   "data"     : { ... },
 *   "message"  : "Thành công",
 *   "timestamp": "2026-03-09T10:00:00",
 *   "errorCode": null,
 *   "traceId"  : null
 * }
 * </pre>
 */
@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Wrapper response chuẩn")
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String message;
    private final LocalDateTime timestamp;
    private final String errorCode;
    private final String traceId;

    private ApiResponse(boolean success, T data, String message,
            String errorCode, String traceId) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.errorCode = errorCode;
        this.traceId = traceId;
    }

    // ── Static factory methods

    /** Thành công + data */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, "Thành công", null, null);
    }

    /** Thành công + data + message tuỳ chỉnh */
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, data, message, null, null);
    }

    /** Thành công, không có data (DELETE, action-only) */
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, null, message, null, null);
    }

    /** Thất bại */
    public static <T> ApiResponse<T> error(String message, String errorCode) {
        return new ApiResponse<>(false, null, message, errorCode, null);
    }

    /** Thất bại + traceId để debug */
    public static <T> ApiResponse<T> error(String message, String errorCode, String traceId) {
        return new ApiResponse<>(false, null, message, errorCode, traceId);
    }

    /**
     * Dùng trong GlobalExceptionHandler khi cần trả data kèm lỗi (VD: validation
     * errors)
     */
    public static <T> ApiResponse<T> errorWithData(T data, String message, String errorCode) {
        return new ApiResponse<>(false, data, message, errorCode, null);
    }

    /** Thất bại — không có errorCode (dùng cho lỗi đơn giản) */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, null, message, null, null);
    }
}
