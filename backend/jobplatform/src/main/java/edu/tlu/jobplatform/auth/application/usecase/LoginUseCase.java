package edu.tlu.jobplatform.auth.application.usecase;

import edu.tlu.jobplatform.auth.application.port.out.TokenStorePort;
import edu.tlu.jobplatform.auth.domain.model.AuthToken;
import edu.tlu.jobplatform.auth.domain.service.PasswordEncoder;
import edu.tlu.jobplatform.auth.infrastructure.security.JwtTokenProvider;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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

        public AuthToken execute(Command cmd) {

                User user = userRepository
                                .findByEmail(cmd.email().toLowerCase().trim())
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Email hoặc mật khẩu không đúng.", "INVALID_CREDENTIALS"));

                if (user.isOAuth2Only()) {
                        throw new BusinessRuleException(
                                        "Tài khoản này đăng nhập bằng Google/Facebook. Vui lòng dùng nút đăng nhập xã hội.",
                                        "USE_OAUTH2");
                }

                // BR-06: bỏ save ở đây
                if (user.isTemporarilyLocked()) {
                        throw new BusinessRuleException(
                                        "Tài khoản tạm thời bị khóa. Vui lòng thử lại sau %d phút."
                                                        .formatted(user.minutesUntilUnlock()),
                                        "ACCOUNT_TEMPORARILY_LOCKED");
                }

                if (!passwordEncoder.matches(cmd.password(), user.getPasswordHash())) {
                        user.recordFailedLogin();
                        userRepository.save(user);

                        int remaining = 5 - user.getFailedLoginAttempts();
                        if (remaining > 0) {
                                log.warn("Failed login: {} — {} attempts left", cmd.email(), remaining);
                                throw new BusinessRuleException(
                                                "Email hoặc mật khẩu không đúng. Còn %d lần thử trước khi bị khóa."
                                                                .formatted(remaining),
                                                "INVALID_CREDENTIALS");
                        } else {
                                log.warn("Account locked: {}", cmd.email());
                                throw new BusinessRuleException(
                                                "Tài khoản bị tạm khóa 30 phút do đăng nhập sai quá nhiều lần.",
                                                "ACCOUNT_TEMPORARILY_LOCKED");
                        }
                }

                // active trước, verified sau
                if (!user.isActive()) {
                        throw new BusinessRuleException(
                                        "Tài khoản đã bị khóa. Vui lòng liên hệ: support@jobplatform.vn",
                                        "ACCOUNT_LOCKED");
                }

                if (!user.isVerified()) {
                        throw new BusinessRuleException(
                                        "Email chưa được xác thực. Vui lòng kiểm tra hộp thư và nhập mã OTP.",
                                        "EMAIL_NOT_VERIFIED");
                }

                if (cmd.portalType() != null) {
                        validatePortalAccess(user, cmd.portalType());
                }

                String tokenId = UUID.randomUUID().toString();
                String accessToken = jwtTokenProvider.generateAccessToken(user, tokenId);
                String refreshToken = jwtTokenProvider.generateRefreshToken(user, tokenId);

                tokenStore.save(user.getId(), tokenId, refreshToken, REFRESH_TTL);

                user.recordLogin(); // reset failedAttempts + set lastLoginAt
                userRepository.save(user);

                log.info("User logged in: {} [{}]", user.getEmail(), user.getId());

                return AuthToken.of(accessToken, refreshToken,
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

        private void validatePortalAccess(User user, String portalType) {
                boolean allowed = switch (portalType) {
                        case "CANDIDATE" -> user.getRole() == UserRole.CANDIDATE;
                        case "EMPLOYER" -> user.getRole() == UserRole.EMPLOYER;
                        case "ADMIN" -> user.getRole() == UserRole.ADMIN;
                        default -> throw new BusinessRuleException(
                                        "Portal không hợp lệ.", "INVALID_PORTAL");
                };

                if (!allowed) {
                        String hint = switch (user.getRole()) {
                                case CANDIDATE -> "Vui lòng đăng nhập tại trang ứng viên.";
                                case EMPLOYER -> "Vui lòng đăng nhập tại trang nhà tuyển dụng.";
                                default -> "Tài khoản không có quyền truy cập trang này.";
                        };
                        throw new BusinessRuleException(hint, "PORTAL_ACCESS_DENIED");
                }
        }

        public record Command(String email, String password, String portalType) {
        }
}
