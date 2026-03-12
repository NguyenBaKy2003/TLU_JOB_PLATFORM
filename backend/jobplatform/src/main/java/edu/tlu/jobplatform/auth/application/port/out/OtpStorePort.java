package edu.tlu.jobplatform.auth.application.port.out;

import java.time.Duration;
import java.util.Optional;

/**
 * OtpStorePort — lưu và tra cứu OTP trong Redis.
 *
 * Key pattern: otp:{purpose}:{email}
 * VD: otp:verify-email:user@example.com
 */
public interface OtpStorePort {

    /**
     * Lưu OTP với TTL.
     *
     * @param purpose mục đích ("verify-email", "reset-password", ...)
     * @param email   email người dùng
     * @param otp     mã OTP
     * @param ttl     thời gian sống
     */
    void save(String purpose, String email, String otp, Duration ttl);

    /**
     * Tìm OTP còn hiệu lực.
     *
     * @return Optional.empty() nếu không tồn tại hoặc đã hết hạn
     */
    Optional<String> find(String purpose, String email);

    /**
     * Xóa OTP sau khi đã dùng (tránh reuse).
     */
    void delete(String purpose, String email);
}