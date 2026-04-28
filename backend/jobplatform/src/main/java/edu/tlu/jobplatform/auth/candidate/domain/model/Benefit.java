// ── Benefit.java ──────────────────────────────────────────────────
package edu.tlu.jobplatform.auth.candidate.domain.model;

import lombok.Builder;
import lombok.Getter;
import java.util.UUID;

@Getter
@Builder
public class Benefit {

    private final UUID id;
    private String name;

    public static Benefit of(String name) {
        return Benefit.builder()
                .id(UUID.randomUUID())
                .name(name)
                .build();
    }
}