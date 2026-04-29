// livestream/presentation/dto/ws/WsChatRequest.java
package edu.tlu.jobplatform.livestream.presentation.dto.ws;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WsChatRequest(
        @NotBlank @Size(max = 300, message = "Tin nhắn không được vượt quá 300 ký tự") String content) {
}