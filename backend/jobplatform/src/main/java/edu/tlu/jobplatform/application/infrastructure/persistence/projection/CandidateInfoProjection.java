package edu.tlu.jobplatform.application.infrastructure.persistence.projection;

import java.util.UUID;

public interface CandidateInfoProjection {
    UUID getUserId();

    String getFirstName();

    String getLastName();

    String getPhone();

    String getAvatarUrl();

    java.time.LocalDateTime getBoostedUntil();

    String getEmail();
}
