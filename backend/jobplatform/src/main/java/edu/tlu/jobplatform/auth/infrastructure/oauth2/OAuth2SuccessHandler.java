package edu.tlu.jobplatform.auth.infrastructure.oauth2;

import edu.tlu.jobplatform.auth.application.port.out.TokenStorePort;
import edu.tlu.jobplatform.auth.infrastructure.security.JwtTokenProvider;
import edu.tlu.jobplatform.user.domain.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
 * 2. Tạo JWT token pair (access + refresh)
 * 3. Lưu refresh token vào Redis
 * 4. Redirect về frontend với token trong query params
 *
 * Redirect URL:
 * {frontendUrl}/auth/oauth2/callback?accessToken=...&refreshToken=...&expiresIn=900
 *
 * Frontend nhận → lưu vào memory/cookie → redirect vào app chính.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final TokenStorePort tokenStore;

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

        // Account bị khóa → redirect về frontend với error
        if (!user.isActive()) {
            log.warn("OAuth2 login blocked — account locked: {}", user.getEmail());
            String errorUrl = UriComponentsBuilder
                    .fromUriString(frontendUrl + "/auth/oauth2/callback")
                    .queryParam("error", "ACCOUNT_LOCKED")
                    .queryParam("message", "Tài khoản đã bị khóa. Vui lòng liên hệ support.")
                    .build().toUriString();
            getRedirectStrategy().sendRedirect(req, res, errorUrl);
            return;
        }

        String tokenId = UUID.randomUUID().toString();
        String accessToken = jwtTokenProvider.generateAccessToken(user, tokenId);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user, tokenId);

        tokenStore.save(user.getId(), tokenId, refreshToken, REFRESH_TTL);

        log.info("OAuth2 login success: {} [{}]", user.getEmail(), user.getId());

        String redirectUrl = UriComponentsBuilder
                .fromUriString(frontendUrl + "/auth/oauth2/callback")
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .queryParam("expiresIn", jwtTokenProvider.getAccessTokenExpirySeconds())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(req, res, redirectUrl);
    }
}
