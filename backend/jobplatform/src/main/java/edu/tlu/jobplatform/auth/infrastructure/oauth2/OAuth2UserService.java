package edu.tlu.jobplatform.auth.infrastructure.oauth2;

import edu.tlu.jobplatform.user.domain.model.User;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(request);

        // "google" | "facebook" — Spring Security đều lowercase
        String provider = request.getClientRegistration().getRegistrationId();
        Map<String, Object> attrs = oAuth2User.getAttributes();

        String providerId = extractProviderId(attrs, provider);
        String email = extractEmail(attrs, provider);
        String name = extractName(attrs, provider);
        String avatar = extractAvatar(attrs, provider);

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(
                    "Không lấy được email từ " + provider);
        }

        User user = userRepository.findByEmail(email.toLowerCase())
                .map(existing -> syncOAuth2User(existing, provider, providerId, avatar))
                .orElseGet(() -> createOAuth2User(email, name, avatar, provider, providerId));

        log.info("OAuth2 login: {} via {} [{}]", email, provider, providerId);
        return new OAuth2UserPrincipal(user, attrs);
    }

    // ── Create / Sync ─────────────────────────────────────────────

    /**
     * Tạo user mới từ OAuth2 — verified = true vì provider đã xác thực email.
     */
    private User createOAuth2User(String email, String name, String avatar,
            String provider, String providerId) {
        User newUser = User.builder()
                .id(UUID.randomUUID())
                .email(email.toLowerCase().trim())
                .passwordHash(null)
                .fullName(name != null && !name.isBlank()
                        ? name.trim()
                        : email.split("@")[0])
                .avatarUrl(avatar)
                .role(UserRole.CANDIDATE)
                .authProvider(provider) // ← "google" | "facebook"
                .authProviderId(providerId) // ← sub / id từ provider
                .active(true)
                .verified(true)
                .createdAt(LocalDateTime.now())
                .build();

        log.info("Creating new OAuth2 user: {} via {}", email, provider);
        return userRepository.save(newUser);
    }

    /**
     * Đồng bộ user đã tồn tại:
     * - Cập nhật authProvider / authProviderId nếu chưa có
     * - Cập nhật avatar nếu chưa có avatar
     */
    private User syncOAuth2User(User existing, String provider,
            String providerId, String avatar) {
        existing.linkOAuth2Provider(provider, providerId);
        existing.syncOAuth2Profile(avatar);
        return userRepository.save(existing);
    }

    // ── Attribute extractors ──────────────────────────────────────

    /**
     * Provider ID dùng để định danh user phía OAuth provider.
     * Google: "sub" | Facebook: "id"
     */
    private String extractProviderId(Map<String, Object> attrs, String provider) {
        return switch (provider) {
            case "google" -> (String) attrs.get("sub");
            case "facebook" -> String.valueOf(attrs.get("id"));
            default -> String.valueOf(attrs.get("id"));
        };
    }

    private String extractEmail(Map<String, Object> attrs, String provider) {
        return switch (provider) {
            case "google" -> (String) attrs.get("email");
            case "facebook" -> (String) attrs.get("email"); // cần scope email
            default -> (String) attrs.get("email");
        };
    }

    private String extractName(Map<String, Object> attrs, String provider) {
        return switch (provider) {
            case "google" -> (String) attrs.get("name");
            case "facebook" -> (String) attrs.get("name"); // Graph API: fields=id,name,email
            default -> (String) attrs.get("name");
        };
    }

    private String extractAvatar(Map<String, Object> attrs, String provider) {
        return switch (provider) {
            case "google" -> (String) attrs.get("picture");
            // Facebook trả về object picture lồng nhau — cần parse riêng nếu cần
            default -> null;
        };
    }
}