package edu.tlu.jobplatform.notification.application.usecase;

import edu.tlu.jobplatform.notification.domain.model.Notification;
import edu.tlu.jobplatform.notification.domain.model.NotificationType;
import edu.tlu.jobplatform.notification.domain.repository.NotificationRepository;
import edu.tlu.jobplatform.notification.domain.service.NotificationDomainService;
import edu.tlu.jobplatform.notification.infrastructure.event.NotificationCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Internal use case — chỉ được gọi bởi event handlers.
 * Tạo notification → lưu DB → publish event để WS handler xử lý.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CreateNotificationUseCase {

        private final NotificationRepository repository;
        private final ApplicationEventPublisher eventPublisher;
        private final NotificationDomainService notificationDomainService;

        @Transactional
        public void execute(Command cmd) {
                Notification notification = notificationDomainService.create(
                                cmd.userId(),
                                cmd.type(), cmd.title(), cmd.body(), cmd.link());

                Notification saved = repository.save(notification);

                eventPublisher.publishEvent(new NotificationCreatedEvent(
                                saved.getId(),
                                saved.getUserId(),
                                saved.getType().name(),
                                saved.getTitle(),
                                saved.getBody(),
                                saved.getLink(),
                                saved.getCreatedAt()));

                log.debug("Notification created: userId={} type={}", cmd.userId(), cmd.type());
        }

        public record Command(
                        UUID userId,
                        NotificationType type,
                        String title,
                        String body,
                        String link) {
        }
}