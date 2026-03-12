package edu.tlu.jobplatform.shared.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
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
 * EmailService — gửi email HTML dùng Thymeleaf template.
 *
 * Tất cả method đều @Async — không block request thread.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Qualifier("emailTemplateEngine")
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from:noreply@jobplatform.vn}")
    private String fromAddress;

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Gửi OTP xác thực email đăng ký.
     *
     * @param toEmail  email người nhận
     * @param fullName tên hiển thị trong email
     * @param otpCode  mã 6 chữ số
     */
    @Async
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

    // ── Core send ─────────────────────────────────────────────────────────────

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
            log.error("Failed to send email: template={} to={} error={}", template, to, e.getMessage());
            // Không throw — email fail không nên crash request
        }
    }
}