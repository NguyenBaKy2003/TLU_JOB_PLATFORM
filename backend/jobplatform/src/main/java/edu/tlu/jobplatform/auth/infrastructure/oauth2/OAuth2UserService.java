package edu.tlu.jobplatform.auth.infrastructure.oauth2;

import edu.tlu.jobplatform.shared.service.ProfileCreationService;
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
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpSession;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final ProfileCreationService profileCreationService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(request);

        String provider = request.getClientRegistration().getRegistrationId();
        Map<String, Object> attrs = oAuth2User.getAttributes();

        String email = extractEmail(attrs, provider);
        String providerId = extractProviderId(attrs, provider);
        String name = extractName(attrs, provider);
        String avatar = extractAvatar(attrs, provider);

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Không lấy được email từ " + provider);
        }

        userRepository.findByEmail(email.toLowerCase()).ifPresent(existing -> {
            if (existing.getRole() == UserRole.ADMIN) {
                log.warn("OAuth2 login blocked for ADMIN account: {}", email);
                throw new OAuth2AuthenticationException(
                        "Admin account must use local login");
            }
        });

        String portalType = readPortalTypeFromSession();
        UserRole roleForNew = "EMPLOYER".equals(portalType)
                ? UserRole.EMPLOYER
                : UserRole.CANDIDATE;

        boolean isNewUser = !userRepository.existsByEmail(email.toLowerCase());

        User user = userRepository.findByEmail(email.toLowerCase())
                .map(existing -> syncOAuth2User(existing, provider, providerId, avatar))
                .orElseGet(() -> createOAuth2User(
                        email, name, avatar, provider, providerId, roleForNew));

        if (isNewUser) {
            profileCreationService.createProfileForUser(user);
            log.info("Profile created for new OAuth2 user={} role={}",
                    user.getId(), user.getRole());
        }

        log.info("OAuth2 loadUser: {} via {} | portal={} | role={}",
                email, provider, portalType, user.getRole());

        return new OAuth2UserPrincipal(user, attrs);
    }

    // ── Session helper ─

    private String readPortalTypeFromSession() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpSession session = attrs.getRequest().getSession(false); // false = không tạo mới
                if (session != null) {
                    Object value = session.getAttribute(
                            CustomAuthorizationRequestResolver.SESSION_KEY_PORTAL_TYPE);
                    if (value instanceof String portal) {
                        return portal;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Cannot read portal type from session", e);
        }
        return "CANDIDATE";
    }

    // ── Domain helpers ─

    private User createOAuth2User(String email, String name, String avatar,
            String provider, String providerId, UserRole role) {
        User newUser = User.builder()
                .id(UUID.randomUUID())
                .email(email.toLowerCase().trim())
                .passwordHash(null)
                .fullName(name != null && !name.isBlank()
                        ? name.trim()
                        : email.split("@")[0])
                .avatarUrl(avatar)
                .role(role)
                .authProvider(provider)
                .authProviderId(providerId)
                .active(true)
                .verified(true)
                .createdAt(LocalDateTime.now())
                .build();

        return userRepository.save(newUser);
    }

    private User syncOAuth2User(User existing, String provider,
            String providerId, String avatar) {
        existing.linkOAuth2Provider(provider, providerId);
        existing.syncOAuth2Profile(avatar);
        return userRepository.save(existing);
    }

    private String extractProviderId(Map<String, Object> attrs, String provider) {
        return switch (provider) {
            case "google" -> (String) attrs.get("sub");
            case "facebook" -> String.valueOf(attrs.get("id"));
            default -> String.valueOf(attrs.get("id"));
        };
    }

    private String extractEmail(Map<String, Object> attrs, String provider) {
        return (String) attrs.get("email");
    }

    private String extractName(Map<String, Object> attrs, String provider) {
        return (String) attrs.get("name");
    }

    private String extractAvatar(Map<String, Object> attrs, String provider) {
        return switch (provider) {
            case "google" -> (String) attrs.get("picture");
            default -> null;
        };
    }
}