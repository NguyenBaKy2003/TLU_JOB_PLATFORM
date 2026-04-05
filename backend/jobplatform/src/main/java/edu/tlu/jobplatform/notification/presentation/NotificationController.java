package edu.tlu.jobplatform.notification.presentation;

import edu.tlu.jobplatform.notification.application.usecase.GetNotificationsUseCase;
import edu.tlu.jobplatform.notification.application.usecase.MarkNotificationReadUseCase;
import edu.tlu.jobplatform.notification.presentation.dto.NotificationResponse;
import edu.tlu.jobplatform.shared.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final GetNotificationsUseCase getNotifications;
    private final MarkNotificationReadUseCase markRead;

    /** GET /api/v1/notifications?page=0&size=20 */
    @GetMapping
    public ResponseEntity<ApiResponse<Result>> list(
            @AuthenticationPrincipal String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        GetNotificationsUseCase.Result result = getNotifications.execute(UUID.fromString(userId), page, size);

        return ResponseEntity.ok(ApiResponse.success(new Result(
                result.notifications().stream().map(NotificationResponse::from).toList(),
                result.unreadCount())));
    }

    /** PATCH /api/v1/notifications/{id}/read */
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markOneRead(
            @PathVariable UUID id,
            @AuthenticationPrincipal String userId) {

        markRead.executeOne(id, UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /** PATCH /api/v1/notifications/read-all */
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Integer>> markAllRead(
            @AuthenticationPrincipal String userId) {

        int count = markRead.executeAll(UUID.fromString(userId));
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    public record Result(List<NotificationResponse> notifications, int unreadCount) {
    }
}