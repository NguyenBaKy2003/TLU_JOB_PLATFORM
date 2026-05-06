// ── SocialLink.java 
package edu.tlu.jobplatform.candidate.domain.model;

import lombok.Builder;
import lombok.Getter;
import java.util.UUID;

@Getter
@Builder
public class SocialLink {

    public enum Platform {
        LINKEDIN, GITHUB, DRIBBLE, INSTAGRAM, PORTFOLIO, BEHANCE
    }

    private final UUID id;
    private Platform platform;
    private String url;

    public static SocialLink of(Platform platform, String url) {
        return SocialLink.builder()
                .id(UUID.randomUUID())
                .platform(platform)
                .url(url)
                .build();
    }
}