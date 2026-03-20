// ── Language.java ─────────────────────────────────────────────────
package edu.tlu.jobplatform.candidate.domain.model;

import lombok.Builder;
import lombok.Getter;
import java.util.UUID;

@Getter
@Builder
public class Language {

    public enum Level {
        A1, A2, B1, B2, C1, C2, NATIVE
    }

    private final UUID id;
    private String name;
    private Level level;

    public static Language of(String name, Level level) {
        return Language.builder()
                .id(UUID.randomUUID())
                .name(name)
                .level(level)
                .build();
    }
}