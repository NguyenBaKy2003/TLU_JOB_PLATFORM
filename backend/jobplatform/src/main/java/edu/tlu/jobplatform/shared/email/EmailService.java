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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Core email service — render Thymeleaf template rồi gửi qua JavaMail.
 *
 * Template reuse strategy:
 * ────────────────
 * Candidate email TÁI SỬ DỤNG 2 template của Company:
 *
 * subscription-activated.html → dùng cho cả Employer và Candidate
 * - Phân biệt bằng biến `userType` ("employer" | "candidate")
 * - Employer: màu xanh dương (#2563eb), CTA "Đăng tin tuyển dụng"
 * - Candidate: màu tím (#7c3aed), CTA "Tìm kiếm việc làm"
 * - Các section chỉ Employer có (featuredPosts, durationDays)
 * ẩn bằng th:if khi userType = "candidate"
 * - Candidate có thêm section features (aiCvWriter, mock interview...)
 *
 * subscription-expired.html → dùng cho cả Employer và Candidate
 * - Employer: màu đỏ (#dc2626), link gia hạn → /employer/plans
 * - Candidate: màu đỏ cam (#ea580c), link gia hạn → /candidate/plans
 * - Danh sách hậu quả thay đổi theo userType
 *
 * Template locations: src/main/resources/templates/email/
 * ├── payment-success.html (Company only — giữ nguyên)
 * ├── subscription-activated.html (Company + Candidate — đã cập nhật)
 * ├── subscription-expired.html (Company + Candidate — đã cập nhật)
 * └── ... (các template khác giữ nguyên)
 * ────────────────
 */
@Slf4j
@Service
public class EmailService {

        private final JavaMailSender mailSender;
        private final TemplateEngine templateEngine;

        private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

        @Value("${app.mail.from:noreply@jobplatform.vn}")
        private String fromAddress;

        @Value("${app.frontend-url:https://jobplatform.vn}")
        private String frontendUrl;

        public EmailService(
                        JavaMailSender mailSender,
                        @Qualifier("emailTemplateEngine") TemplateEngine templateEngine) {
                this.mailSender = mailSender;
                this.templateEngine = templateEngine;
        }

        // ── Auth emails ──

        @Async("aiTaskExecutor")
        public void sendPasswordResetEmail(String toEmail, String fullName, String resetLink) {
                send(toEmail, "[CareerUp] Đặt lại mật khẩu của bạn", "reset-password",
                                Map.of("fullName", fullName, "resetLink", resetLink, "expireMinutes", "15"));
        }

        @Async("aiTaskExecutor")
        public void sendPasswordChangedNotification(String toEmail, String fullName) {
                send(toEmail, "[CareerUp] Mật khẩu của bạn vừa được thay đổi", "password-changed",
                                Map.of("fullName", fullName, "supportEmail", "support@jobplatform.vn"));
        }

        @Async("aiTaskExecutor")
        public void sendVerificationOtp(String toEmail, String fullName, String otpCode) {
                send(toEmail, "[CareerUp] Mã xác thực tài khoản của bạn", "verify-email",
                                Map.of("fullName", fullName, "otpCode", otpCode, "expireMinutes", "10"));
        }

        // ── Settings emails ───────────────────────────────────────────────

        @Async("aiTaskExecutor")
        public void sendEmailChangeConfirmation(String toOldEmail, String recipientName,
                        String newEmail, String confirmLink) {
                send(newEmail, "[CareerUp] Xác nhận địa chỉ email mới của bạn",
                                "email-change-confirm",
                                Map.of("fullName", recipientName, "newEmail", newEmail,
                                                "confirmLink", confirmLink, "expireMinutes", "15"));
                log.info("Email change confirmation sent: oldEmail={} → newEmail={}", toOldEmail, newEmail);
        }

        @Async("aiTaskExecutor")
        public void sendEmailChangedNotification(String toOldEmail, String recipientName,
                        String newEmail) {
                send(toOldEmail, "[CareerUp] Địa chỉ email của bạn đã thay đổi",
                                "email-changed-notification",
                                Map.of("fullName", recipientName, "oldEmail", toOldEmail,
                                                "newEmail", newEmail,
                                                "changedAt", LocalDateTime.now().format(DATETIME_FMT)));
        }

        @Async("aiTaskExecutor")
        public void sendAccountDeletedNotification(String toEmail, String recipientName) {
                send(toEmail, "[CareerUp] Tài khoản của bạn đã được xóa", "account-deleted",
                                Map.of("fullName", recipientName, "email", toEmail,
                                                "deletedAt", LocalDateTime.now().format(DATETIME_FMT)));
        }

        // ── Other emails ─

        @Async("aiTaskExecutor")
        public void sendInterviewScheduledEmail(String toEmail, String candidateName,
                        String jobTitle, String companyName,
                        String scheduledAt, String location, String note) {
                send(toEmail, "[CareerUp] Bạn có lịch phỏng vấn tại " + companyName,
                                "interview-scheduled",
                                Map.of("candidateName", candidateName, "jobTitle", jobTitle,
                                                "companyName", companyName, "scheduledAt", scheduledAt,
                                                "location", location, "note", note != null ? note : "",
                                                "supportEmail", "support@jobplatform.vn"));
        }

        @Async("aiTaskExecutor")
        public void sendWelcomeEmail(String toEmail, String fullName) {
                send(toEmail, "[CareerUp] Chào mừng bạn đến với CareerUp!", "welcome",
                                Map.of("fullName", fullName,
                                                "loginLink", frontendUrl + "/dashboard",
                                                "supportEmail", "support@jobplatform.vn"));
        }

        // ── Company subscription emails ───────────────────────────────────

        @Async("aiTaskExecutor")
        public void sendPaymentSuccessEmail(String toEmail, String fullName,
                        String planCode, BigDecimal amount,
                        String gateway, String transactionId) {
                send(toEmail, "[CareerUp] Thanh toán thành công", "payment-success",
                                Map.of("fullName", fullName,
                                                "planCode", planCode,
                                                "amount", String.format("%,.0f VND", amount),
                                                "gateway", gateway,
                                                "transactionId", transactionId,
                                                "paidAt", LocalDateTime.now().format(DATETIME_FMT),
                                                "dashboardLink", frontendUrl + "/employer/dashboard",
                                                "supportEmail", "support@jobplatform.vn"));
        }

        /**
         * Gói Employer kích hoạt — dùng template subscription-activated.html.
         * userType = "employer" → hiện section đăng tin, màu xanh dương.
         */
        @Async("aiTaskExecutor")
        public void sendSubscriptionActivatedEmail(String toEmail, String fullName,
                        String planName, LocalDateTime expiresAt,
                        int jobPostLimit) {
                send(toEmail, "[CareerUp] Gói dịch vụ của bạn đã được kích hoạt",
                                "subscription-activated",
                                Map.of("fullName", fullName,
                                                "planName", planName,
                                                "expiresAt", expiresAt.format(DATETIME_FMT),
                                                "jobPostLimit", String.valueOf(jobPostLimit),
                                                "userType", "employer",
                                                "dashboardLink", frontendUrl + "/employer/dashboard",
                                                "supportEmail", "support@jobplatform.vn"));
        }

        /**
         * Gói Employer hết hạn — dùng template subscription-expired.html.
         * userType = "employer" → link gia hạn tới /employer/plans, màu đỏ.
         */
        @Async("aiTaskExecutor")
        public void sendSubscriptionExpiredEmail(String toEmail, String fullName,
                        String planCode) {
                send(toEmail, "[CareerUp] Gói dịch vụ của bạn đã hết hạn",
                                "subscription-expired",
                                Map.of("fullName", fullName,
                                                "planCode", planCode,
                                                "expiredAt", LocalDateTime.now().format(DATETIME_FMT),
                                                "userType", "employer",
                                                "renewLink", frontendUrl + "/employer/plans",
                                                "upgradeLink", frontendUrl + "/employer/plans",
                                                "promoCode", "RENEW10",
                                                "supportEmail", "support@jobplatform.vn"));
        }

        // ── Candidate subscription emails ─────────────────────────────────

        /**
         * Gói Candidate kích hoạt — TÁI SỬ DỤNG subscription-activated.html.
         *
         * Dùng Map.ofEntries() thay Map.of() vì:
         * 1. Map.of() chỉ hỗ trợ tối đa 10 key-value pairs.
         * 2. Map<String, Object> không nhận boolean literal trực tiếp khi
         * compiler không thể infer type — phải ép tường minh qua Map.entry().
         *
         * Template dùng th:if="${userType == 'candidate'}" để phân nhánh UI.
         */
        @Async("aiTaskExecutor")
        public void sendCandidateSubscriptionActivatedEmail(String toEmail, String fullName,
                        String planName,
                        LocalDateTime expiresAt,
                        BigDecimal amount,
                        String gateway,
                        String paymentId) {
                // Resolve feature flags từ planCode — Pro trở lên có profileAnalytics,
                // chỉ Premium có AI CV Writer, Mock Interview, Salary Insights.
                boolean isPremium = planName != null && ("PREMIUM".equalsIgnoreCase(planName)
                                || planName.toLowerCase().contains("premium"));

                Map<String, Object> vars = new java.util.HashMap<>();
                vars.put("fullName", fullName);
                vars.put("planName", planName);
                vars.put("expiresAt", expiresAt.format(DATETIME_FMT));
                vars.put("amount", String.format("%,.0f VND", amount));
                vars.put("gateway", gateway);
                vars.put("transactionId", paymentId);
                vars.put("paidAt", LocalDateTime.now().format(DATETIME_FMT));
                vars.put("userType", "candidate");
                vars.put("aiCvWriter", isPremium);
                vars.put("profileAnalytics", true); // Pro trở lên đều có
                vars.put("mockInterview", isPremium);
                vars.put("salaryInsights", isPremium);
                vars.put("dashboardLink", frontendUrl + "/candidate/dashboard");
                vars.put("supportEmail", "support@jobplatform.vn");

                send(toEmail, "[CareerUp] Gói dịch vụ của bạn đã được kích hoạt",
                                "subscription-activated", vars);
        }

        /**
         * Gói Candidate hết hạn — TÁI SỬ DỤNG subscription-expired.html.
         *
         * Biến khác so với Employer:
         * - userType = "candidate" → template hiện danh sách hậu quả candidate
         * - renewLink → /candidate/plans
         * - Không hiện upgradeLink (candidate chỉ có 3 tier)
         */
        @Async("aiTaskExecutor")
        public void sendCandidateSubscriptionExpiredEmail(String toEmail, String fullName,
                        String planCode) {
                send(toEmail, "[CareerUp] Gói dịch vụ của bạn đã hết hạn",
                                "subscription-expired",
                                Map.of("fullName", fullName,
                                                "planCode", planCode,
                                                "expiredAt", LocalDateTime.now().format(DATETIME_FMT),
                                                "userType", "candidate",
                                                "renewLink", frontendUrl + "/candidate/plans",
                                                "upgradeLink", frontendUrl + "/candidate/plans",
                                                "promoCode", "UPGRADE10",
                                                "supportEmail", "support@jobplatform.vn"));
        }

        // ── Core send ────

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
                        log.info("[Email] Sent: template={} to={}", template, to);

                } catch (MessagingException e) {
                        log.error("[Email] Failed: template={} to={} error={}",
                                        template, to, e.getMessage());
                }
        }
}