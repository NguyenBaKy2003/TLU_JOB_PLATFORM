package edu.tlu.jobplatform.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * Hết hạn mức (quota) trong gói dịch vụ — HTTP 422.
 *
 * Dùng khi công ty đã dùng hết số bài đăng trong gói hiện tại.
 *
 * Ví dụ:
 *   - Gói Starter cho phép 5 bài/tháng, đã dùng hết 5
 *   - Gói Business cho 20 bài, đã dùng hết 20
 *
 * Cách dùng:
 * <pre>
 *   throw new QuotaExceededException("Starter", 5);
 *   // → "Đã hết 5 lượt đăng bài trong gói Starter. Vui lòng nâng cấp."
 * </pre>
 */
public class QuotaExceededException extends DomainException {

    public QuotaExceededException(String planName, int limit) {
        super(
            "Đã hết " + limit + " lượt đăng bài trong gói " + planName
                + ". Vui lòng nâng cấp gói dịch vụ để tiếp tục.",
            "QUOTA_EXCEEDED",
            HttpStatus.UNPROCESSABLE_ENTITY
        );
    }

    public QuotaExceededException(String message) {
        super(message, "QUOTA_EXCEEDED", HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
