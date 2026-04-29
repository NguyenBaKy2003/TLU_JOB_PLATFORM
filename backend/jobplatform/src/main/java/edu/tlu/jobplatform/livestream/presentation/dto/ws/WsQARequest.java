// livestream/presentation/dto/ws/WsQARequest.java
package edu.tlu.jobplatform.livestream.presentation.dto.ws;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record WsQARequest(
        @NotBlank @Size(max = 500, message = "Câu hỏi không được vượt quá 500 ký tự") String question) {
}