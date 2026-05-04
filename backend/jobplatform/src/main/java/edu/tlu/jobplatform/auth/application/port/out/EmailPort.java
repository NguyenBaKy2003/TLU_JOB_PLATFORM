package edu.tlu.jobplatform.auth.application.port.out;

/**
 * Output Port để gửi email transactional.
 *
 * Domain UseCase không biết dùng SendGrid, SMTP hay gì khác.
 * Interface chỉ mô tả "cần gửi email gì" — không quan tâm "gửi bằng cách nào".
 *
 * Implementations:
 * - ConsoleEmailAdapter (Sprint 1 dev: chỉ log ra console)
 * - SendGridEmailAdapter (Sprint 4 production)
 *
 * Để đổi từ console sang SendGrid:
 * → Chỉ thêm @Primary vào SendGridEmailAdapter, UseCase không cần sửa.
 */
public interface EmailPort {

    /**
     * Gửi link đặt lại mật khẩu.
     *
     * @param toEmail       địa chỉ email người nhận
     * @param recipientName tên hiển thị trong email (thân thiện hơn)
     * @param resetLink     link dạng:
     *                      https://jobplatform.vn/reset-password?token=xxx&userId=yyy
     */
    void sendPasswordResetEmail(String toEmail, String recipientName, String resetLink);

    /**
     * Thông báo đổi mật khẩu thành công.
     * Giúp user phát hiện nếu tài khoản bị xâm phạm.
     *
     * @param toEmail       địa chỉ email người nhận
     * @param recipientName tên hiển thị
     */
    void sendPasswordChangedNotification(String toEmail, String recipientName);

    /**
     * Gửi mã OTP xác thực email sau đăng ký (hoặc gửi lại).
     *
     * @param toEmail địa chỉ email người nhận
     * @param otp     mã OTP 6 số
     */
    void sendOtpEmail(String toEmail, String otp);

    /**
     * Gửi link xác nhận đổi email đến email MỚI.
     *
     * @param toOldEmail    email hiện tại (để thông báo)
     * @param recipientName tên user
     * @param newEmail      email mới (nơi gửi link xác nhận)
     * @param confirmLink   link xác nhận
     */
    void sendEmailChangeConfirmation(String toOldEmail, String recipientName,
            String newEmail, String confirmLink);

    /**
     * Thông báo đổi email thành công — gửi đến email CŨ.
     * Giúp user phát hiện nếu tài khoản bị xâm phạm.
     */
    void sendEmailChangedNotification(String toOldEmail, String recipientName, String newEmail);

    /**
     * Thông báo tài khoản đã bị xóa.
     */
    void sendAccountDeletedNotification(String toEmail, String recipientName);

}
