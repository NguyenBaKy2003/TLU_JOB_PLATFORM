// request/SendMessageRequest.java
package edu.tlu.jobplatform.message.presentation.dto.request;

import edu.tlu.jobplatform.message.domain.model.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record SendMessageRequest(
        @NotNull UUID conversationId,
        @NotBlank String content,
        MessageType type // nullable → default TEXT
) {
}