package edu.tlu.jobplatform.shared.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

/**
 * Core email service — render Thymeleaf template rồi gửi qua JavaMail.
 *
 * Tất cả method đều @Async (dùng aiTaskExecutor từ AsyncConfig) —
 * không block request thread khi gửi email.
 *
 * Template locations: src/main/resources/templates/email/
 * ├── reset-password.html (forgot password link)
 * └── password-changed.html (thông báo đổi mật khẩu thành công)
 *
 * Class này là shared infrastructure — không phải domain service.
 * Domain UseCase không gọi trực tiếp class này mà gọi qua EmailPort interface.
 * JavaMailEmailAdapter (auth domain) implements EmailPort và delegate vào đây.
 */
@Slf4j
@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from:noreply@jobplatform.vn}")
    private String fromAddress;

    public EmailService(
            JavaMailSender mailSender,
            @Qualifier("emailTemplateEngine") TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    // ── Public API ────────────────────────────────────────────────

    /**
     * Gửi link đặt lại mật khẩu.
     *
     * Template variables:
     * - fullName : tên người nhận
     * - resetLink : URL đặt lại mật khẩu (hết hạn 15 phút)
     * - expireMinutes : "15"
     */
    @Async("aiTaskExecutor")
    public void sendPasswordResetEmail(String toEmail, String fullName, String resetLink) {
        send(
                toEmail,
                "[JobPlatform] Đặt lại mật khẩu của bạn",
                "reset-password",
                Map.of(
                        "fullName", fullName,
                        "resetLink", resetLink,
                        "expireMinutes", "15"));
    }

    /**
     * Gửi thông báo mật khẩu vừa được thay đổi.
     * Giúp user phát hiện nếu tài khoản bị xâm phạm.
     *
     * Template variables:
     * - fullName : tên người nhận
     * - supportEmail : địa chỉ support
     */
    @Async("aiTaskExecutor")
    public void sendPasswordChangedNotification(String toEmail, String fullName) {
        send(
                toEmail,
                "[JobPlatform] Mật khẩu của bạn vừa được thay đổi",
                "password-changed",
                Map.of(
                        "fullName", fullName,
                        "supportEmail", "support@jobplatform.vn"));
    }

    /**
     * Gửi OTP xác thực email đăng ký.
     * (Dùng cho Sprint 4 khi bật email verification flow)
     *
     * Template variables:
     * - fullName : tên người nhận
     * - otpCode : mã 6 chữ số
     * - expireMinutes : "10"
     */
    @Async("aiTaskExecutor")
    public void sendVerificationOtp(String toEmail, String fullName, String otpCode) {
        send(
                toEmail,
                "[JobPlatform] Mã xác thực tài khoản của bạn",
                "verify-email",
                Map.of(
                        "fullName", fullName,
                        "otpCode", otpCode,
                        "expireMinutes", "10"));
    }

    // ── Core send ─────────────────────────────────────────────────

    /**
     * Render template Thymeleaf → HTML → gửi MimeMessage.
     * Không throw exception — email fail không được crash request.
     */
    private void send(String to, String subject, String template, Map<String, Object> vars) {
        try {
            Context ctx = new Context();
            ctx.setVariables(vars);
            String html = templateEngine.process(template, ctx);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true); // true = isHtml

            mailSender.send(message);
            log.info("Email sent: template={} to={}", template, to);

        } catch (MessagingException e) {
            // Log lỗi nhưng không re-throw — tránh rollback transaction của UseCase
            log.error("Failed to send email: template={} to={} error={}",
                    template, to, e.getMessage());
        }
    }

    @Async("aiTaskExecutor")
    public void sendInterviewScheduledEmail(
            String toEmail,
            String candidateName,
            String jobTitle,
            String companyName,
            String scheduledAt,
            String location,
            String note) {

        send(
                toEmail,
                "[JobPlatform] Bạn có lịch phỏng vấn tại " + companyName,
                "interview-scheduled",
                Map.of(
                        "candidateName", candidateName,
                        "jobTitle", jobTitle,
                        "companyName", companyName,
                        "scheduledAt", scheduledAt,
                        "location", location,
                        "note", note != null ? note : "",
                        "supportEmail", "support@jobplatform.vn"));
    }

}
