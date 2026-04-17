// application/port/out/ParticipantQueryPort.java
package edu.tlu.jobplatform.message.application.port.out;

import edu.tlu.jobplatform.message.presentation.dto.response.ParticipantInfo;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

public interface ParticipantQueryPort {

    ParticipantInfo getEmployer(UUID ownerId);

    ParticipantInfo getCandidate(UUID userId);

    /** Batch — tránh N+1 khi load inbox */
    Map<UUID, ParticipantInfo> getEmployersByOwnerIds(Set<UUID> ownerIds);

    Map<UUID, ParticipantInfo> getCandidatesByUserIds(Set<UUID> userIds);
}