package edu.tlu.jobplatform.auth.infrastructure.security;

import edu.tlu.jobplatform.user.domain.model.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

/**
 * Tạo và xác thực JWT token.
 *
 * Access Token payload:
 * 
 * <pre>
 * {
 *   "sub"  : "{userId}",      ← UUID của user
 *   "email": "...",
 *   "role" : "CANDIDATE",
 *   "tid"  : "{tokenId}",     ← liên kết với refresh token trong Redis
 *   "jti"  : "{unique-uuid}", ← JWT ID, dùng để blacklist khi logout
 *   "iat"  : ...,
 *   "exp"  : ...
 * }
 * </pre>
 *
 * Refresh Token payload:
 * 
 * <pre>
 * {
 *   "sub"  : "{userId}",
 *   "tid"  : "{tokenId}",    ← PHẢI trùng tokenId với access token cùng phiên
 *   "type" : "refresh",
 *   "exp"  : ...
 * }
 * </pre>
 *
 * Config trong application.yml:
 * 
 * <pre>
 * app:
 *   jwt:
 *     secret: "your-256-bit-secret-key-minimum-32-chars"
 *     access-token-expiry-ms: 900000     # 15 phút
 *     refresh-token-expiry-ms: 2592000000 # 30 ngày
 * </pre>
 */
@Slf4j
@Component
public class JwtTokenProvider {

    private final SecretKey secretKey;
    private final long accessTokenExpiryMs;
    private final long refreshTokenExpiryMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-expiry-ms:900000}") long accessMs,
            @Value("${app.jwt.refresh-token-expiry-ms:2592000000}") long refreshMs) {

        if (secret.length() < 32)
            throw new IllegalArgumentException("JWT secret phải có ít nhất 32 ký tự");

        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiryMs = accessMs;
        this.refreshTokenExpiryMs = refreshMs;
    }

    // ── Tạo token ─────

    public String generateAccessToken(User user, String tokenId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("tid", tokenId)
                .id(UUID.randomUUID().toString()) // jti — unique per token
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(accessTokenExpiryMs)))
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    public String generateRefreshToken(User user, String tokenId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("tid", tokenId)
                .claim("type", "refresh")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(refreshTokenExpiryMs)))
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    // ── Xác thực token

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.debug("JWT expired");
        } catch (MalformedJwtException e) {
            log.warn("JWT malformed");
        } catch (SecurityException e) {
            log.warn("JWT signature invalid");
        } catch (IllegalArgumentException e) {
            log.warn("JWT empty/null");
        }
        return false;
    }

    // ── Đọc claims ────

    public UUID extractUserId(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    public String extractEmail(String token) {
        return parseClaims(token).get("email", String.class);
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public String extractTokenId(String token) {
        return parseClaims(token).get("tid", String.class);
    }

    public String extractJti(String token) {
        return parseClaims(token).getId();
    }

    /** Số giây access token còn lại — để set TTL blacklist chính xác */
    public long getRemainingSeconds(String token) {
        try {
            Date exp = parseClaims(token).getExpiration();
            return Math.max(0, (exp.getTime() - System.currentTimeMillis()) / 1000);
        } catch (Exception e) {
            return 0;
        }
    }

    /** Số giây access token sống — trả về cho client để biết khi nào cần refresh */
    public long getAccessTokenExpirySeconds() {
        return accessTokenExpiryMs / 1000;
    }

    // ── Helper ────────

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
