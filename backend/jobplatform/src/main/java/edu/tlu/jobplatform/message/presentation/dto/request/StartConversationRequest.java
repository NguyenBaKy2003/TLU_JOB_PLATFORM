// request/StartConversationRequest.java
package edu.tlu.jobplatform.message.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record StartConversationRequest(
        @NotNull UUID candidateId,
        @NotNull UUID jobPostId) {
}