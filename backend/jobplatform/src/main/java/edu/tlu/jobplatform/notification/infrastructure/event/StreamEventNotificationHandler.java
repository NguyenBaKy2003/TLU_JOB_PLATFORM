package edu.tlu.jobplatform.notification.infrastructure.event;

import edu.tlu.jobplatform.notification.application.usecase.CreateNotificationUseCase;
import edu.tlu.jobplatform.notification.domain.model.NotificationType;
import edu.tlu.jobplatform.shared.event.livestream.StreamEventCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class StreamEventNotificationHandler {

    private final CreateNotificationUseCase createNotification;

    @Async("taskExecutor")
    @EventListener
    public void onStreamEvent(StreamEventCreatedEvent event) {
        switch (event.type()) {
            case INTERVIEW_INVITE -> handleInterviewInvite(event);
            case JOB_SPOTLIGHT -> handleJobSpotlight(event);
            default -> log.debug("No notification for stream event type: {}", event.type());
        }
    }

    private void handleInterviewInvite(StreamEventCreatedEvent event) {
        createNotification.execute(new CreateNotificationUseCase.Command(
                event.recipientId(),
                NotificationType.INTERVIEW_INVITE,
                "Lời mời phỏng vấn",
                "Nhà tuyển dụng đã mời bạn vào slot phỏng vấn trong phiên livestream",
                "/streams/" + event.sessionId() + "/watch"));

        log.debug("Notification saved: INTERVIEW_INVITE, recipient={}, session={}",
                event.recipientId(), event.sessionId());
    }

    private void handleJobSpotlight(StreamEventCreatedEvent event) {
        if (event.recipientId() == null)
            return;

        createNotification.execute(new CreateNotificationUseCase.Command(
                event.recipientId(),
                NotificationType.JOB_SPOTLIGHT,
                "Tin tuyển dụng nổi bật",
                "Một tin tuyển dụng vừa được spotlight trong phiên livestream",
                "/streams/" + event.sessionId() + "/watch"));

        log.debug("Notification saved: JOB_SPOTLIGHT, recipient={}, session={}",
                event.recipientId(), event.sessionId());
    }
}