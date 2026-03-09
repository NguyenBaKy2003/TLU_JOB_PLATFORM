package edu.tlu.jobplatform.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * Vi phạm business rule — HTTP 422.
 *
 * Dùng khi request hợp lệ về kỹ thuật nhưng sai về nghiệp vụ.
 *
 * Ví dụ:
 *   - Bài đăng đã hết hạn không thể ứng tuyển
 *   - Email chưa xác thực không thể đăng nhập
 *   - OTP sai hoặc hết hạn
 *   - Password quá yếu
 *
 * Cách dùng:
 * <pre>
 *   throw new BusinessRuleException(
 *       "Bài đăng đã hết hạn, không thể ứng tuyển.",
 *       "JOB_EXPIRED"
 *   );
 * </pre>
 */
public class BusinessRuleException extends DomainException {

    public BusinessRuleException(String message, String errorCode) {
        super(message, errorCode, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}
