package edu.tlu.jobplatform.auth.infrastructure.oauth2;

import edu.tlu.jobplatform.user.domain.model.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Getter
public class OAuth2UserPrincipal implements OAuth2User {

    private final User domainUser;
    private final Map<String, Object> attributes;

    public OAuth2UserPrincipal(User domainUser, Map<String, Object> attributes) {
        this.domainUser = domainUser;
        this.attributes = attributes;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(domainUser.getRole().toAuthority()));
    }

    /** getName() = userId string — Spring Security dùng làm principal name */
    @Override
    public String getName() {
        return domainUser.getId().toString();
    }
}
