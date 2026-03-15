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

/**
 * Load và đồng bộ User từ OAuth2 provider (Google, FaceBook).
 *
 * Được Spring Security gọi sau khi user cấp quyền ở Google/FaceBook.
 *
 * Flow:
 * 1. Spring Security lấy token từ provider
 * 2. Gọi UserInfo endpoint → nhận attributes
 * 3. loadUser() được gọi với request + attributes
 * 4. Email đã có DB → cập nhật avatar nếu cần
 * Email chưa có → tạo user mới (verified=true, OAuth2-only)
 * 5. Trả về OAuth2UserPrincipal → OAuth2SuccessHandler tạo JWT
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(request);

        String provider = request.getClientRegistration().getRegistrationId(); // "google"
        Map<String, Object> attrs = oAuth2User.getAttributes();

        String email = extractEmail(attrs, provider);
        String name = extractName(attrs, provider);
        String avatar = extractAvatar(attrs, provider);

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Không lấy được email từ " + provider);
        }

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createOAuth2User(email, name, avatar));

        log.info("OAuth2 login: {} via {}", email, provider);
        return new OAuth2UserPrincipal(user, attrs);
    }

    // ── Helpers ───────────────────────────────────────────────────

    private User createOAuth2User(String email, String name, String avatar) {
        User newUser = User.builder()
                .id(UUID.randomUUID())
                .email(email.toLowerCase())
                .passwordHash(null) // OAuth2-only, không có password
                .fullName(name != null ? name : email.split("@")[0])
                .avatarUrl(avatar)
                .role(UserRole.CANDIDATE)
                .active(true)
                .verified(true) // Provider đã verify email
                .createdAt(LocalDateTime.now())
                .build();
        return userRepository.save(newUser);
    }

    private String extractEmail(Map<String, Object> attrs, String provider) {
        return switch (provider) {
            case "google" -> (String) attrs.get("email");
            case "FaceBook" -> (String) attrs.get("emailAddress");
            default -> (String) attrs.get("email");
        };
    }

    private String extractName(Map<String, Object> attrs, String provider) {
        return switch (provider) {
            case "google" -> (String) attrs.get("name");
            case "FaceBook" -> attrs.get("localizedFirstName") + " " + attrs.get("localizedLastName");
            default -> (String) attrs.get("name");
        };
    }

    private String extractAvatar(Map<String, Object> attrs, String provider) {
        return switch (provider) {
            case "google" -> (String) attrs.get("picture");
            default -> null;
        };
    }
}
