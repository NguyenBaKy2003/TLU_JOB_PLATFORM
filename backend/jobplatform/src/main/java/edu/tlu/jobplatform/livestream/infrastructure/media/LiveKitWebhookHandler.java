package edu.tlu.jobplatform.livestream.infrastructure.media;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Nhận webhook POST từ LiveKit Server khi có sự kiện phòng:
 * room_finished, participant_joined, participant_left, egress_ended...
 *
 * Cấu hình trong livekit.yaml:
 * webhook:
 * urls:
 * - http://<ngrok-backend-url>/webhooks/livekit
 * api_key: devkey
 */
@RestController
@RequestMapping("/webhooks/livekit")
@RequiredArgsConstructor
@Slf4j
public class LiveKitWebhookHandler {

    private final ObjectMapper objectMapper;

    @Value("${livekit.webhook-secret:}")
    private String webhookSecret;

    @PostMapping
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            JsonNode event = objectMapper.readTree(body);
            String eventType = event.path("event").asText();
            log.info("[LiveKit Webhook] Nhận event: {}", eventType);

            switch (eventType) {
                case "room_finished" -> handleRoomFinished(event);
                case "egress_ended" -> handleEgressEnded(event);
                case "participant_joined" -> handleParticipantJoined(event);
                case "participant_left" -> handleParticipantLeft(event);
                default -> log.debug("[LiveKit Webhook] Event không xử lý: {}", eventType);
            }
        } catch (Exception e) {
            log.error("[LiveKit Webhook] Lỗi xử lý webhook: {}", e.getMessage(), e);
        }

        return ResponseEntity.ok().build();
    }

    private void handleRoomFinished(JsonNode event) {
        String roomName = event.path("room").path("name").asText();
        log.info("[LiveKit] Room kết thúc: {}", roomName);
    }

    private void handleEgressEnded(JsonNode event) {
        String egressId = event.path("egressInfo").path("egressId").asText();
        String fileUrl = event.path("egressInfo").path("fileResults")
                .path(0).path("location").asText();
        String roomName = event.path("egressInfo").path("roomName").asText();

        log.info("[LiveKit] Egress hoàn tất. Room={}, fileUrl={}", roomName, fileUrl);
    }

    private void handleParticipantJoined(JsonNode event) {
        String roomName = event.path("room").path("name").asText();
        String identity = event.path("participant").path("identity").asText();
        log.debug("[LiveKit] Participant joined: {} vào room {}", identity, roomName);
    }

    private void handleParticipantLeft(JsonNode event) {
        String roomName = event.path("room").path("name").asText();
        String identity = event.path("participant").path("identity").asText();
        log.debug("[LiveKit] Participant left: {} rời room {}", identity, roomName);
    }
}