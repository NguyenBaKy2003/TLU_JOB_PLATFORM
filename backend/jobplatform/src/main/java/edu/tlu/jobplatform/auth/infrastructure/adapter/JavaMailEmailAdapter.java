package edu.tlu.jobplatform.auth.infrastructure.adapter;

import edu.tlu.jobplatform.auth.application.port.out.EmailPort;
import edu.tlu.jobplatform.shared.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

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

    @Override
    public void sendEmailChangeConfirmation(String toOldEmail, String recipientName,
            String newEmail, String confirmLink) {
        emailService.sendEmailChangeConfirmation(toOldEmail, recipientName, newEmail, confirmLink);
    }

    @Override
    public void sendEmailChangedNotification(String toOldEmail, String recipientName, String newEmail) {
        emailService.sendEmailChangedNotification(toOldEmail, recipientName, newEmail);
    }

    @Override
    public void sendAccountDeletedNotification(String toEmail, String recipientName) {
        emailService.sendAccountDeletedNotification(toEmail, recipientName);
    }
}
