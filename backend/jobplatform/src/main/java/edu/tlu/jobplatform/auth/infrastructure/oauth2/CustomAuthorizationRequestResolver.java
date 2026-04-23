package edu.tlu.jobplatform.auth.infrastructure.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

/**
 * Tùy chỉnh OAuth2AuthorizationRequest để lưu portalType vào HttpSession.
 *
 * TẠI SAO KHÔNG DÙNG state hay additionalParameters?
 *
 * - state: Spring Security tự sinh CSRF token và ghi đè — không thể nhúng
 * data tùy chỉnh một cách an toàn (sẽ phá vỡ CSRF validation).
 *
 * - additionalParameters: chỉ được gửi đến Google trong authorization request,
 * Google không echo chúng lại trong callback.
 * OAuth2UserRequest.getAdditionalParameters()
 * ở loadUser() sẽ trống.
 *
 * GIẢI PHÁP — HttpSession:
 * Session persist xuyên suốt toàn bộ OAuth2 roundtrip (redirect → Google →
 * callback).
 * Resolver lưu portalType vào session với key SESSION_KEY_PORTAL_TYPE.
 * OAuth2UserService và OAuth2SuccessHandler đọc từ session qua
 * RequestContextHolder.
 *
 * Flow:
 * 1. Frontend gọi GET /auth/oauth2/url/google?portal=EMPLOYER (AuthController)
 * 2. AuthController trả URL:
 * {baseUrl}/oauth2/authorization/google?portal=EMPLOYER
 * 3. Browser redirect → /oauth2/authorization/google?portal=EMPLOYER
 * 4. Resolver.resolve() chạy: đọc "portal" param → lưu "EMPLOYER" vào session
 * 5. Browser redirect → Google → Google callback → /login/oauth2/code/google
 * 6. OAuth2UserService.loadUser() đọc session → role = EMPLOYER khi tạo user
 * mới
 * 7. OAuth2SuccessHandler đọc session → kiểm tra portal access → redirect về
 * frontend
 */
@Slf4j
@Component
public class CustomAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

    /** Session key để lưu/đọc portalType xuyên suốt OAuth2 roundtrip */
    public static final String SESSION_KEY_PORTAL_TYPE = "oauth2_portal_type";

    private final DefaultOAuth2AuthorizationRequestResolver defaultResolver;

    public CustomAuthorizationRequestResolver(ClientRegistrationRepository repo) {
        this.defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(
                repo, "/oauth2/authorization");
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest base = defaultResolver.resolve(request);
        return savePortalAndReturn(request, base);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request,
            String clientRegistrationId) {
        OAuth2AuthorizationRequest base = defaultResolver.resolve(request, clientRegistrationId);
        return savePortalAndReturn(request, base);
    }

    // ── Private

    private OAuth2AuthorizationRequest savePortalAndReturn(
            HttpServletRequest request, OAuth2AuthorizationRequest base) {
        if (base == null)
            return null;

        String portalType = extractPortalType(request);

        // Lưu vào session — tồn tại đến khi Google callback về (vài giây)
        request.getSession().setAttribute(SESSION_KEY_PORTAL_TYPE, portalType);

        log.debug("OAuth2 authorization: portal={} sessionId={}",
                portalType, request.getSession().getId());

        // Trả nguyên base — KHÔNG sửa state, tránh phá CSRF validation của Spring
        // Security
        return base;
    }

    /**
     * Đọc portalType từ query param "portal".
     * AuthController tạo URL dạng: /oauth2/authorization/google?portal=EMPLOYER
     * Chỉ chấp nhận EMPLOYER / CANDIDATE / ADMIN — fallback về CANDIDATE.
     */
    private String extractPortalType(HttpServletRequest request) {
        String param = request.getParameter("portal");
        if (param != null) {
            String upper = param.toUpperCase().trim();
            if ("EMPLOYER".equals(upper) || "CANDIDATE".equals(upper) || "ADMIN".equals(upper)) {
                return upper;
            }
        }
        return "CANDIDATE";
    }
}