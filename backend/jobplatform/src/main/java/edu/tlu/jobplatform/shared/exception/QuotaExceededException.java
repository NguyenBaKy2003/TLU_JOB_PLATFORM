package edu.tlu.jobplatform.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * Hết hạn mức (quota) trong gói dịch vụ — HTTP 422.
 *
 * Dùng khi công ty đã dùng hết số bài đăng trong gói hiện tại.
 *
 * Ví dụ:
 * - Gói Starter cho phép 5 bài/tháng, đã dùng hết 5
 * - Gói Business cho 20 bài, đã dùng hết 20
 *
 * Cách dùng:
 * 
 * <pre>
 * throw new QuotaExceededException("Starter", 5);
 * // → "Đã hết 5 lượt đăng bài trong gói Starter. Vui lòng nâng cấp."
 * </pre>
 */
public class QuotaExceededException extends DomainException {

    public QuotaExceededException(String message, String code) {
        super(message, code, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}