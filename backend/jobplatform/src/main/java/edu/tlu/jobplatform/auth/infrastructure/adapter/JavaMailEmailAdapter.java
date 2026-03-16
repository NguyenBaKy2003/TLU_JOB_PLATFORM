package edu.tlu.jobplatform.auth.infrastructure.adapter;

import edu.tlu.jobplatform.auth.application.port.out.EmailPort;
import edu.tlu.jobplatform.shared.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * Adapter: implement domain EmailPort bằng shared EmailService (JavaMail +
 * Thymeleaf).
 *
 * @Primary → Spring inject bean này thay vì ConsoleEmailAdapter khi cả hai cùng
 *          tồn tại.
 *          ConsoleEmailAdapter vẫn còn nhưng chỉ active với @Profile("!prod")
 *          và không @Primary.
 *
 *          Dependency diagram:
 *
 *          ForgotPasswordUseCase
 *          │ inject
 *          ▼
 *          EmailPort ← domain interface (auth/application/port/out)
 *          ▲ implements
 *          JavaMailEmailAdapter ← adapter này
 *          │ inject
 *          ▼
 *          EmailService ← shared infrastructure (JavaMail + Thymeleaf)
 *
 *          Lợi ích của lớp Adapter trung gian:
 *          - Domain UseCase không import bất kỳ class Spring/Mail nào
 *          - Dễ mock trong test: mock EmailPort thay vì mock JavaMailSender
 *          - Đổi provider email (SendGrid, AWS SES...) chỉ cần thay Adapter
 */
@Primary
@Component
@RequiredArgsConstructor
public class JavaMailEmailAdapter implements EmailPort {

    private final EmailService emailService;

    @Override
    public void sendPasswordResetEmail(String toEmail, String recipientName, String resetLink) {
        emailService.sendPasswordResetEmail(toEmail, recipientName, resetLink);
    }

    @Override
    public void sendPasswordChangedNotification(String toEmail, String recipientName) {
        emailService.sendPasswordChangedNotification(toEmail, recipientName);
    }

    @Override
    public void sendOtpEmail(String toEmail, String otp) {
        emailService.sendVerificationOtp(toEmail, toEmail, otp);
    }
}
