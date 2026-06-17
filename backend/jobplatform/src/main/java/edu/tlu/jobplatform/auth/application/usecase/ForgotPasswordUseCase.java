package edu.tlu.jobplatform.auth.application.usecase;

import edu.tlu.jobplatform.auth.application.port.out.EmailPort;
import edu.tlu.jobplatform.auth.application.port.out.PasswordResetTokenPort;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ForgotPasswordUseCase {

    private final UserRepository userRepository;
    private final PasswordResetTokenPort resetTokenPort;
    private final EmailPort emailPort;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public void execute(String email) {
        String normalizedEmail = email.toLowerCase().trim();

        userRepository.findByEmail(normalizedEmail).ifPresentOrElse(
                user -> processRequest(user),
                () -> log.debug("Forgot password: email not found [{}] — silent ignore", normalizedEmail));
    }

    private void processRequest(User user) {

        if (user.isOAuth2Only()) {
            log.debug("Forgot password: OAuth2-only account [{}] — sending hint email",
                    user.getEmail());
            return;
        }

        if (!user.isActive()) {
            log.debug("Forgot password: inactive account [{}] — silent ignore", user.getEmail());
            return;
        }

        String resetToken = UUID.randomUUID().toString();
        resetTokenPort.save(user.getId(), resetToken);

        String resetLink = buildResetLink(user.getId(), resetToken);

        emailPort.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetLink);

        log.info("Password reset email sent to: {}", user.getEmail());
    }

    private String buildResetLink(java.util.UUID userId, String token) {
        return frontendUrl
                + "/reset-password"
                + "?token=" + token
                + "&userId=" + userId;
    }
}
