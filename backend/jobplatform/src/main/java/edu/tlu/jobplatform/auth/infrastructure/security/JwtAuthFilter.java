package edu.tlu.jobplatform.auth.infrastructure.security;

import edu.tlu.jobplatform.auth.application.port.out.TokenStorePort;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filter kiểm tra JWT trên mọi HTTP request.
 *
 * Flow:
 * 1. Trích xuất token từ "Authorization: Bearer {token}"
 * 2. Validate JWT (signature + expiry)
 * 3. Kiểm tra jti không nằm trong blacklist (đã logout)
 * 4. Set Authentication vào SecurityContext
 *
 * Không bao giờ throw exception — nếu token invalid thì để
 * SecurityContext trống; Spring Security chặn endpoint protected sau đó.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final TokenStorePort tokenStore;

    @Override
    protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse res,
            FilterChain chain)
            throws ServletException, IOException {

        String token = extractBearerToken(req);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            String jti = jwtTokenProvider.extractJti(token);
            if (tokenStore.isBlacklisted(jti)) {
                log.debug("Rejected blacklisted token jti={}", jti);
            } else {
                authenticate(token, req);
            }
        }

        chain.doFilter(req, res);
    }

    private void authenticate(String token, HttpServletRequest req) {
        try {
            String userId = jwtTokenProvider.extractUserId(token).toString();
            String role = jwtTokenProvider.extractRole(token);

            // principal = userId string → SecurityUtils.getCurrentUserId() lấy bằng
            // getName()
            var auth = new UsernamePasswordAuthenticationToken(
                    userId, null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role)));
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception e) {
            log.error("Failed to set authentication: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }
    }

    /** Lấy token từ header "Authorization: Bearer {token}" */
    private String extractBearerToken(HttpServletRequest req) {
        String header = req.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7).trim();
        }
        return null;
    }

    /** Skip filter cho các path public — không cần kiểm tra JWT */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        String path = req.getRequestURI();
        return path.startsWith("/api/v1/auth/")
                || path.startsWith("/api/v1/ws/")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/api-docs")
                || path.equals("/actuator/health");
    }
}
