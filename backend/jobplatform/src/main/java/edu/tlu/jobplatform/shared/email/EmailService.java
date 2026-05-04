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

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Core email service — render Thymeleaf template rồi gửi qua JavaMail.
 *
 * Tất cả method đều @Async (dùng aiTaskExecutor từ AsyncConfig) —
 * không block request thread khi gửi email.
 *
 * Template locations: src/main/resources/templates/email/
 * ├── reset-password.html (forgot password link)
 * ├── password-changed.html (thông báo đổi mật khẩu thành công)
 * ├── verify-email.html (OTP xác thực đăng ký)
 * ├── interview-scheduled.html (lịch phỏng vấn)
 * ├── email-change-confirm.html (link xác nhận đổi email → gửi đến email MỚI)
 * ├── email-changed-notification.html (thông báo đổi email thành công → gửi đến
 * email CŨ)
 * └── account-deleted.html (thông báo xóa tài khoản)
 */
@Slf4j
@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

    @Value("${app.mail.from:noreply@jobplatform.vn}")
    private String fromAddress;

    public EmailService(
            JavaMailSender mailSender,
            @Qualifier("emailTemplateEngine") TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    // ── Auth emails ───────────────────────────────────────────────────────────

    /**
     * Gửi link đặt lại mật khẩu.
     *
     * Template variables: fullName, resetLink, expireMinutes
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
     * Template variables: fullName, supportEmail
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
     *
     * Template variables: fullName, otpCode, expireMinutes
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

    // ── Settings emails ───────────────────────────────────────────────────────

    /**
     * Bước 1 đổi email: gửi link xác nhận đến email MỚI.
     *
     * Template variables: fullName, newEmail, confirmLink, expireMinutes
     *
     * @param toOldEmail    email hiện tại (chỉ để log — link gửi đến newEmail)
     * @param recipientName tên user
     * @param newEmail      email mới — nơi nhận link xác nhận
     * @param confirmLink   link xác nhận (TTL 15 phút)
     */
    @Async("aiTaskExecutor")
    public void sendEmailChangeConfirmation(String toOldEmail, String recipientName,
            String newEmail, String confirmLink) {
        send(
                newEmail, // ← gửi đến email MỚI
                "[JobPlatform] Xác nhận địa chỉ email mới của bạn",
                "email-change-confirm",
                Map.of(
                        "fullName", recipientName,
                        "newEmail", newEmail,
                        "confirmLink", confirmLink,
                        "expireMinutes", "15"));

        log.info("Email change confirmation sent: userId related oldEmail={} → newEmail={}", toOldEmail, newEmail);
    }

    /**
     * Bước 2 đổi email: thông báo đổi email thành công — gửi đến email CŨ.
     * Giúp user phát hiện nếu tài khoản bị xâm phạm.
     *
     * Template variables: fullName, oldEmail, newEmail, changedAt
     *
     * @param toOldEmail    email cũ (nơi nhận thông báo)
     * @param recipientName tên user
     * @param newEmail      email mới vừa được xác nhận
     */
    @Async("aiTaskExecutor")
    public void sendEmailChangedNotification(String toOldEmail, String recipientName, String newEmail) {
        send(
                toOldEmail, // ← gửi đến email CŨ
                "[JobPlatform] Địa chỉ email của bạn đã thay đổi",
                "email-changed-notification",
                Map.of(
                        "fullName", recipientName,
                        "oldEmail", toOldEmail,
                        "newEmail", newEmail,
                        "changedAt", LocalDateTime.now().format(DATETIME_FMT)));
    }

    /**
     * Thông báo tài khoản đã bị xóa.
     *
     * Template variables: fullName, email, deletedAt
     *
     * @param toEmail       địa chỉ email người nhận (email của tài khoản vừa xóa)
     * @param recipientName tên user
     */
    @Async("aiTaskExecutor")
    public void sendAccountDeletedNotification(String toEmail, String recipientName) {
        send(
                toEmail,
                "[JobPlatform] Tài khoản của bạn đã được xóa",
                "account-deleted",
                Map.of(
                        "fullName", recipientName,
                        "email", toEmail,
                        "deletedAt", LocalDateTime.now().format(DATETIME_FMT)));
    }

    // ── Other emails ──────────────────────────────────────────────────────────

    @Async("aiTaskExecutor")
    public void sendInterviewScheduledEmail(
            String toEmail, String candidateName, String jobTitle,
            String companyName, String scheduledAt, String location, String note) {
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

    // ── Core send ─────────────────────────────────────────────────────────────

    /**
     * Render Thymeleaf template → HTML → gửi MimeMessage.
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
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Email sent: template={} to={}", template, to);

        } catch (MessagingException e) {
            log.error("Failed to send email: template={} to={} error={}",
                    template, to, e.getMessage());
        }
    }
}