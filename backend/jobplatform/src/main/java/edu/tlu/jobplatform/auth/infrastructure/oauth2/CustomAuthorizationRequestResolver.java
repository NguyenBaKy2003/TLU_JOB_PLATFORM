package edu.tlu.jobplatform.auth.infrastructure.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CustomAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

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

    private OAuth2AuthorizationRequest savePortalAndReturn(
            HttpServletRequest request, OAuth2AuthorizationRequest base) {
        if (base == null)
            return null;

        String portalType = extractPortalType(request);

        request.getSession().setAttribute(SESSION_KEY_PORTAL_TYPE, portalType);

        log.debug("OAuth2 authorization: portal={} sessionId={}",
                portalType, request.getSession().getId());

        return base;
    }

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