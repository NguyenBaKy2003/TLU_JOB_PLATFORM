package edu.tlu.jobplatform.auth.application.port.out;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;

/**
 * Output Port để lưu trữ, tìm kiếm và xóa refresh token.
 *
 * UseCase gọi interface này — không biết Redis hay bất kỳ storage nào tồn tại.
 * Implementation: RedisTokenStoreAdapter trong infrastructure/adapter.
 *
 * Redis key design:
 * 
 * <pre>
 *   refresh:{userId}:{tokenId}  → JWT refresh token string  (TTL 30 ngày)
 *   blacklist:{jti}             → "1"                       (TTL = remaining của access token)
 * </pre>
 *
 * Dùng {userId} trong key để có thể xóa toàn bộ session của 1 user:
 * KEYS refresh:{userId}:* → deleteAll()
 */
public interface TokenStorePort {

    /**
     * Lưu refresh token.
     *
     * @param userId  chủ sở hữu token
     * @param tokenId ID phiên — cùng tokenId với access token ("tid" claim)
     * @param token   giá trị JWT refresh token
     * @param ttl     thời gian sống (30 ngày)
     */
    void save(UUID userId, String tokenId, String token, Duration ttl);

    /**
     * Tìm refresh token.
     * Trả về empty nếu không tồn tại hoặc đã hết hạn (Redis tự xóa sau TTL).
     */
    Optional<String> find(UUID userId, String tokenId);

    /** Xóa 1 refresh token — logout thiết bị hiện tại */
    void delete(UUID userId, String tokenId);

    /** Xóa TẤT CẢ refresh token của user — logout mọi thiết bị */
    void deleteAll(UUID userId);

    /**
     * Đưa access token vào blacklist cho đến khi hết TTL tự nhiên.
     * Dùng khi logout — token chưa hết hạn nhưng cần vô hiệu hóa ngay.
     *
     * @param jti JWT ID (claim "jti" trong payload)
     * @param ttl thời gian còn lại của access token
     */
    void blacklist(String jti, Duration ttl);

    /** Kiểm tra jti có đang trong blacklist không */
    boolean isBlacklisted(String jti);

    /**
     * Revoke tất cả session của user TRỪ session hiện tại.
     * Dùng sau khi đổi mật khẩu — giữ session đang thao tác, xóa các thiết bị khác.
     *
     * @param userId      chủ sở hữu các session
     * @param keepTokenId tokenId của session cần giữ lại
     */
    void deleteAllExcept(UUID userId, String keepTokenId);
}
