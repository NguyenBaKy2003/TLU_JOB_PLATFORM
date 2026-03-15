package edu.tlu.jobplatform.shared.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Base exception cho tất cả business exception trong hệ thống.
 *
 * Mọi exception liên quan đến nghiệp vụ đều kế thừa class này.
 * GlobalExceptionHandler bắt DomainException và format thành ApiResponse.
 *
 * Quy ước errorCode: {DOMAIN}_{NUMBER}
 * VD: USER_001, JOB_003, APPLICATION_002
 */
@Getter
public abstract class DomainException extends RuntimeException {

    /** Mã lỗi có cấu trúc — frontend dùng để xử lý logic */
    private final String     errorCode;

    /** HTTP status trả về */
    private final HttpStatus httpStatus;

    protected DomainException(String message, String errorCode, HttpStatus httpStatus) {
        super(message);
        this.errorCode  = errorCode;
        this.httpStatus = httpStatus;
    }

    protected DomainException(String message, String errorCode,
                               HttpStatus httpStatus, Throwable cause) {
        super(message, cause);
        this.errorCode  = errorCode;
        this.httpStatus = httpStatus;
    }
}
