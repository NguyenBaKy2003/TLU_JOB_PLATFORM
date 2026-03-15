package edu.tlu.jobplatform.auth.domain.service;

/**
 * Domain interface để mã hóa và xác minh password.
 *
 * Domain layer KHÔNG import bất kỳ thư viện nào (BCrypt, Spring...).
 * Interface này chỉ mô tả "cần làm gì" — không quan tâm "dùng thuật toán nào".
 *
 * Implementation: BCryptPasswordEncoderAdapter trong infrastructure layer.
 *
 * Lợi ích:
 *   - Đổi BCrypt → Argon2 chỉ cần thay 1 Adapter, UseCase không đổi
 *   - Test UseCase dễ dàng bằng mock: when(encoder.encode(...)).thenReturn("hash")
 */
public interface PasswordEncoder {

    /**
     * Hash raw password để lưu vào DB.
     * Mỗi lần gọi trả về hash khác nhau (salt ngẫu nhiên).
     *
     * @param rawPassword mật khẩu người dùng nhập
     * @return BCrypt hash string, ví dụ: "$2b$12$..."
     */
    String encode(String rawPassword);

    /**
     * Kiểm tra raw password có khớp với encoded hash không.
     *
     * @param rawPassword     mật khẩu vừa nhập
     * @param encodedPassword hash đang lưu trong DB
     * @return true nếu khớp
     */
    boolean matches(String rawPassword, String encodedPassword);
}
