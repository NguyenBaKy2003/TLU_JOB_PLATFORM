package edu.tlu.jobplatform.auth.application.port.out;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenPort {

    Duration TOKEN_TTL = Duration.ofMinutes(15);

    /**
     * Lưu reset token cho user.
     * Ghi đè token cũ nếu đã tồn tại (1 user = 1 token tại 1 thời điểm).
     *
     * @param userId UUID của user cần reset
     * @param token  UUID token ngẫu nhiên (sẽ nhúng vào link email)
     */
    void save(UUID userId, String token);

    /**
     * Lấy reset token của user.
     * Trả về empty nếu token không tồn tại hoặc đã hết hạn.
     */
    Optional<String> find(UUID userId);

    /**
     * Xóa reset token — gọi ngay sau khi đổi password thành công.
     * Đảm bảo link reset chỉ dùng được 1 lần.
     */
    void delete(UUID userId);
}
