package edu.tlu.jobplatform.user.application.port.out;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

/**
 * Output Port để lưu token xác nhận đổi email.
 *
 * Redis key design:
 * 
 * <pre>
 *   email_change:{userId}  → newEmail|token  (TTL 15 phút)
 * </pre>
 *
 * Lý do ghép newEmail + token vào 1 value:
 * → 1 key thay vì 2 key → atomic save/delete
 * → Khi verify chỉ cần userId → lấy được cả token lẫn email mới
 */
public interface EmailChangeTokenPort {

    Duration TOKEN_TTL = Duration.ofMinutes(15);

    /**
     * Lưu yêu cầu đổi email.
     * Ghi đè request cũ nếu user request nhiều lần.
     *
     * @param userId   UUID của user
     * @param newEmail email mới muốn đổi sang
     * @param token    UUID token ngẫu nhiên (nhúng vào link email)
     */
    void save(UUID userId, String newEmail, String token);

    /**
     * Tìm pending request đổi email của user.
     * Trả về empty nếu không tồn tại hoặc đã hết hạn.
     */
    Optional<EmailChangeRequest> find(UUID userId);

    /**
     * Xóa request sau khi xác nhận thành công (link 1 lần dùng).
     */
    void delete(UUID userId);

    record EmailChangeRequest(String newEmail, String token) {
    }
}