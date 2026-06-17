package edu.tlu.jobplatform.auth.application.usecase;

import edu.tlu.jobplatform.auth.application.port.out.TokenStorePort;
import edu.tlu.jobplatform.auth.domain.model.AuthToken;
import edu.tlu.jobplatform.auth.infrastructure.security.JwtTokenProvider;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenUseCase {

        private final JwtTokenProvider jwtTokenProvider;
        private final TokenStorePort tokenStore;
        private final UserRepository userRepository;

        public AuthToken execute(String refreshToken) {

                if (!jwtTokenProvider.validateToken(refreshToken)) {
                        throw new BusinessRuleException(
                                        "Refresh token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
                                        "INVALID_REFRESH_TOKEN");
                }

                UUID userId = jwtTokenProvider.extractUserId(refreshToken);
                String tokenId = jwtTokenProvider.extractTokenId(refreshToken);

                tokenStore.find(userId, tokenId)
                                .orElseThrow(() -> new BusinessRuleException(
                                                "Phiên đăng nhập không còn hiệu lực. Vui lòng đăng nhập lại.",
                                                "SESSION_EXPIRED"));

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> ResourceNotFoundException.user(userId));

                if (!user.canLogin()) {
                        throw new BusinessRuleException(
                                        "Tài khoản không thể đăng nhập.", "ACCOUNT_INACTIVE");
                }

                String newAccessToken = jwtTokenProvider.generateAccessToken(user, tokenId);
                log.debug("Token refreshed for user: {}", userId);

                return AuthToken.of(
                                newAccessToken, refreshToken,
                                jwtTokenProvider.getAccessTokenExpirySeconds(),
                                AuthToken.UserSummary.builder()
                                                .id(user.getId()).email(user.getEmail())
                                                .fullName(user.getFullName()).role(user.getRole().name())
                                                .avatarUrl(user.getAvatarUrl()).verified(user.isVerified())
                                                .build());
        }
}
