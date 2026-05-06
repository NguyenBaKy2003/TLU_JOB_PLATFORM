package edu.tlu.jobplatform.auth.application.usecase;

import edu.tlu.jobplatform.auth.application.port.out.TokenStorePort;
import edu.tlu.jobplatform.auth.infrastructure.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

/**
 * UseCase: Đăng xuất.
 *
 * logout() — logout thiết bị hiện tại (xóa 1 tokenId)
 * logoutAll() — logout tất cả thiết bị (xóa toàn bộ token của user)
 *
 * Cả hai đều blacklist access token hiện tại cho đến khi nó hết hạn tự nhiên,
 * ngăn việc dùng lại token dù còn trong thời hạn.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LogoutUseCase {

    private final JwtTokenProvider jwtTokenProvider;
    private final TokenStorePort tokenStore;

    /** Logout thiết bị hiện tại. */
    public void logout(String accessToken) {
        if (!jwtTokenProvider.validateToken(accessToken)) {
            // Token đã expired/invalid → coi như đã logout, không cần làm gì
            return;
        }
        UUID userId = jwtTokenProvider.extractUserId(accessToken);
        String tokenId = jwtTokenProvider.extractTokenId(accessToken);
        String jti = jwtTokenProvider.extractJti(accessToken);

        tokenStore.delete(userId, tokenId);
        blacklistIfNeeded(jti, accessToken);

        log.info("User logged out: {} [tokenId={}]", userId, tokenId);
    }

    /** Logout tất cả thiết bị — revoke mọi phiên đang hoạt động. */
    public void logoutAll(String accessToken) {
        if (!jwtTokenProvider.validateToken(accessToken)) {
            return;
        }
        UUID userId = jwtTokenProvider.extractUserId(accessToken);
        String jti = jwtTokenProvider.extractJti(accessToken);

        tokenStore.deleteAll(userId);
        blacklistIfNeeded(jti, accessToken);

        log.info("User logged out from all devices: {}", userId);
    }

    // ── Helper

    private void blacklistIfNeeded(String jti, String accessToken) {
        long remaining = jwtTokenProvider.getRemainingSeconds(accessToken);
        if (remaining > 0) {
            tokenStore.blacklist(jti, Duration.ofSeconds(remaining));
        }
    }
}
