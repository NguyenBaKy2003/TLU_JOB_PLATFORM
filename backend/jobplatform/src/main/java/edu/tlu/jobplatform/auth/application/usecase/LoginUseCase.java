package edu.tlu.jobplatform.auth.application.usecase;

import edu.tlu.jobplatform.auth.application.port.out.TokenStorePort;
import edu.tlu.jobplatform.auth.domain.model.AuthToken;
import edu.tlu.jobplatform.auth.domain.service.PasswordEncoder;
import edu.tlu.jobplatform.auth.infrastructure.security.JwtTokenProvider;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.UUID;

/**
 * UseCase: Đăng nhập bằng email + password.
 *
 * Business Rules:
 * BR-01: Email không tồn tại → message chung (tránh user enumeration)
 * BR-02: Password sai → cùng message BR-01
 * BR-03: OAuth2-only account → hướng dẫn dùng Google/FaceBook
 * BR-04: Email chưa verify → yêu cầu xác thực email
 * BR-05: Account bị khóa → liên hệ support
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LoginUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenStorePort tokenStore;

    private static final Duration REFRESH_TTL = Duration.ofDays(30);

    @Transactional
    public AuthToken execute(Command cmd) {

        // BR-01: dùng message chung để tránh user enumeration attack
        User user = userRepository
                .findByEmail(cmd.email().toLowerCase().trim())
                .orElseThrow(() -> new BusinessRuleException(
                        "Email hoặc mật khẩu không đúng.", "INVALID_CREDENTIALS"));

        // BR-03: OAuth2-only
        if (user.isOAuth2Only()) {
            throw new BusinessRuleException(
                    "Tài khoản này đăng nhập bằng Google/FaceBook. Vui lòng dùng nút đăng nhập xã hội.",
                    "USE_OAUTH2");
        }

        // BR-02: verify password — cùng message với BR-01
        if (!passwordEncoder.matches(cmd.password(), user.getPasswordHash())) {
            log.warn("Failed login attempt: {}", cmd.email());
            throw new BusinessRuleException(
                    "Email hoặc mật khẩu không đúng.", "INVALID_CREDENTIALS");
        }

        // BR-04: email phải verified
        if (!user.isVerified()) {
            throw new BusinessRuleException(
                    "Email chưa được xác thực. Vui lòng kiểm tra hộp thư và nhập mã OTP.",
                    "EMAIL_NOT_VERIFIED");
        }

        // BR-05: account phải active
        if (!user.isActive()) {
            throw new BusinessRuleException(
                    "Tài khoản đã bị khóa. Vui lòng liên hệ: support@jobplatform.vn",
                    "ACCOUNT_LOCKED");
        }

        // Tạo JWT token pair
        String tokenId = UUID.randomUUID().toString();
        String accessToken = jwtTokenProvider.generateAccessToken(user, tokenId);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user, tokenId);

        // Lưu refresh token vào Redis
        tokenStore.save(user.getId(), tokenId, refreshToken, REFRESH_TTL);

        // Ghi nhận thời điểm login
        user.recordLogin();
        userRepository.save(user);

        log.info("User logged in: {} [{}]", user.getEmail(), user.getId());

        return AuthToken.of(
                accessToken, refreshToken,
                jwtTokenProvider.getAccessTokenExpirySeconds(),
                toUserSummary(user));
    }

    private AuthToken.UserSummary toUserSummary(User u) {
        return AuthToken.UserSummary.builder()
                .id(u.getId()).email(u.getEmail())
                .fullName(u.getFullName()).role(u.getRole().name())
                .avatarUrl(u.getAvatarUrl()).verified(u.isVerified())
                .build();
    }

    public record Command(String email, String password) {
    }
}
