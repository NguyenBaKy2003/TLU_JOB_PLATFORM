package edu.tlu.jobplatform.auth.application.usecase;

import edu.tlu.jobplatform.auth.application.port.out.TokenStorePort;
import edu.tlu.jobplatform.auth.infrastructure.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class LogoutUseCase {

    private final JwtTokenProvider jwtTokenProvider;
    private final TokenStorePort tokenStore;

    public void logout(String accessToken) {
        if (!jwtTokenProvider.validateToken(accessToken)) {
            return;
        }
        UUID userId = jwtTokenProvider.extractUserId(accessToken);
        String tokenId = jwtTokenProvider.extractTokenId(accessToken);
        String jti = jwtTokenProvider.extractJti(accessToken);

        tokenStore.delete(userId, tokenId);
        blacklistIfNeeded(jti, accessToken);

        log.info("User logged out: {} [tokenId={}]", userId, tokenId);
    }

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

    private void blacklistIfNeeded(String jti, String accessToken) {
        long remaining = jwtTokenProvider.getRemainingSeconds(accessToken);
        if (remaining > 0) {
            tokenStore.blacklist(jti, Duration.ofSeconds(remaining));
        }
    }
}
