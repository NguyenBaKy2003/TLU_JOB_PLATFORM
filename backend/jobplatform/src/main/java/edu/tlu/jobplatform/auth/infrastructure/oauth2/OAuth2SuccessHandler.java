package edu.tlu.jobplatform.auth.infrastructure.oauth2;

import edu.tlu.jobplatform.auth.application.port.out.TokenStorePort;
import edu.tlu.jobplatform.auth.infrastructure.security.JwtTokenProvider;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

/**
 * Xử lý sau khi OAuth2 login thành công.
 *
 * Flow:
 * 1. Lấy domain User từ OAuth2UserPrincipal
 * 2. Kiểm tra account active
 * 3. Đọc portalType từ session (được lưu bởi
 * CustomAuthorizationRequestResolver)
 * 4. Kiểm tra portal access — nhất quán với LoginUseCase#validatePortalAccess:
 * - Sai portal → redirect về frontend với error PORTAL_ACCESS_DENIED
 * 5. Tạo JWT token pair, lưu refresh token vào Redis
 * 6. Xóa portalType khỏi session (cleanup)
 * 7. Redirect về frontend với token + portal trong query params
 *
 * Redirect thành công:
 * {frontendUrl}/auth/oauth2/callback?accessToken=...&refreshToken=...&expiresIn=900&portal=EMPLOYER
 *
 * Redirect lỗi:
 * {frontendUrl}/auth/oauth2/callback?error=PORTAL_ACCESS_DENIED&message=...
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final TokenStorePort tokenStore;
    private final UserRepository userRepository;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    private static final Duration REFRESH_TTL = Duration.ofDays(30);

    @Override
    public void onAuthenticationSuccess(HttpServletRequest req,
            HttpServletResponse res,
            Authentication auth) throws IOException {
        if (res.isCommitted()) {
            log.warn("Response already committed, skipping redirect");
            return;
        }

        OAuth2UserPrincipal principal = (OAuth2UserPrincipal) auth.getPrincipal();
        User user = principal.getDomainUser();

        // ── 1. Đọc portalType từ session ─────────────────────────────────────
        // Session được tạo bởi CustomAuthorizationRequestResolver lúc bắt đầu flow.
        // Đọc trước khi cleanup để dùng cho cả portal check và redirect URL.
        String portalType = readPortalTypeFromSession(req);
        log.debug("OAuth2 success: email={} portal={} sessionId={}",
                user.getEmail(), portalType, req.getSession(false) != null
                        ? req.getSession(false).getId()
                        : "null");

        // ── 2. Kiểm tra account bị khóa ──────────────────────────────────────
        if (!user.isActive()) {
            log.warn("OAuth2 login blocked — account locked: {}", user.getEmail());
            cleanupSession(req);
            redirectError(req, res, "ACCOUNT_LOCKED",
                    "Tài khoản đã bị khóa. Vui lòng liên hệ support.");
            return;
        }

        // ── 3. Kiểm tra portal access ─────────────────────────────────────────
        // Nhất quán với LoginUseCase#validatePortalAccess:
        // CANDIDATE chỉ vào trang Candidate, EMPLOYER chỉ vào trang Employer.
        if (!isPortalAllowed(user, portalType)) {
            String hint = switch (user.getRole()) {
                case CANDIDATE -> "Tài khoản này là ứng viên. Vui lòng đăng nhập tại trang ứng viên.";
                case EMPLOYER -> "Tài khoản này là nhà tuyển dụng. Vui lòng đăng nhập tại trang nhà tuyển dụng.";
                default -> "Tài khoản không có quyền truy cập trang này.";
            };
            log.warn("OAuth2 portal mismatch: email={} role={} attemptedPortal={}",
                    user.getEmail(), user.getRole(), portalType);
            cleanupSession(req);
            redirectError(req, res, "PORTAL_ACCESS_DENIED", hint);
            return;
        }

        // ── 4. Ghi nhận đăng nhập ────────────────────────────────────────────
        user.recordLogin();
        userRepository.save(user);

        // ── 5. Tạo token pair ────────────────────────────────────────────────
        String tokenId = UUID.randomUUID().toString();
        String accessToken = jwtTokenProvider.generateAccessToken(user, tokenId);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user, tokenId);
        tokenStore.save(user.getId(), tokenId, refreshToken, REFRESH_TTL);

        // ── 6. Cleanup session ───────────────────────────────────────────────
        cleanupSession(req);

        log.info("OAuth2 login success: {} [{}] portal={}",
                user.getEmail(), user.getId(), portalType);

        // ── 7. Redirect về frontend ──────────────────────────────────────────
        String redirectUrl = UriComponentsBuilder
                .fromUriString(frontendUrl + "/auth/oauth2/callback")
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .queryParam("expiresIn", jwtTokenProvider.getAccessTokenExpirySeconds())
                .queryParam("portal", portalType) // frontend dùng để redirect đúng dashboard
                .build().toUriString();

        getRedirectStrategy().sendRedirect(req, res, redirectUrl);
    }

    // ── Session helpers ───────────────────────────────────────────────────────

    /**
     * Đọc portalType từ session.
     * Fallback về "CANDIDATE" nếu session không tồn tại hoặc key bị thiếu.
     */
    private String readPortalTypeFromSession(HttpServletRequest req) {
        HttpSession session = req.getSession(false); // false = không tạo session mới
        if (session != null) {
            Object value = session.getAttribute(
                    CustomAuthorizationRequestResolver.SESSION_KEY_PORTAL_TYPE);
            if (value instanceof String portal) {
                return portal;
            }
        }
        log.warn("Portal type not found in session — defaulting to CANDIDATE");
        return "CANDIDATE";
    }

    /** Xóa portalType khỏi session sau khi đã dùng xong. */
    private void cleanupSession(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.removeAttribute(
                    CustomAuthorizationRequestResolver.SESSION_KEY_PORTAL_TYPE);
        }
    }

    // ── Business logic helpers ────────────────────────────────────────────────

    /**
     * Nhất quán với LoginUseCase#validatePortalAccess.
     * CANDIDATE chỉ vào portal CANDIDATE, EMPLOYER chỉ vào portal EMPLOYER.
     */
    private boolean isPortalAllowed(User user, String portalType) {
        return switch (portalType) {
            case "EMPLOYER" -> user.getRole() == UserRole.EMPLOYER;
            case "CANDIDATE" -> user.getRole() == UserRole.CANDIDATE;
            case "ADMIN" -> user.getRole() == UserRole.ADMIN;
            default -> false;
        };
    }

    /** Redirect về frontend callback với error params. */
    private void redirectError(HttpServletRequest req, HttpServletResponse res,
            String errorCode, String message) throws IOException {
        String url = UriComponentsBuilder
                .fromUriString(frontendUrl + "/auth/oauth2/callback")
                .queryParam("error", errorCode)
                .queryParam("message", message)
                .build().toUriString();
        getRedirectStrategy().sendRedirect(req, res, url);
    }
}