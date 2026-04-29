package edu.tlu.jobplatform.livestream.presentation.dto.ws;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WsViewerCountPayload {
    private UUID sessionId;
    private int viewerCount;
    private LocalDateTime timestamp;
}