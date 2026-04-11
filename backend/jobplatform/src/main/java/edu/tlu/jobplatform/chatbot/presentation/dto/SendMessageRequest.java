package edu.tlu.jobplatform.chatbot.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record SendMessageRequest(
    UUID   sessionId,

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    @Size(max = 2000, message = "Tin nhắn tối đa 2000 ký tự")
    String content
) {}
