package edu.tlu.jobplatform.notification.application.usecase;

import edu.tlu.jobplatform.notification.domain.model.Notification;
import edu.tlu.jobplatform.notification.domain.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetNotificationsUseCase {

    private final NotificationRepository repository;

    @Transactional(readOnly = true)
    public Result execute(UUID userId, int page, int size) {
        List<Notification> items = repository.findByUserId(userId, page, size);
        int unread = repository.countUnreadByUserId(userId);
        return new Result(items, unread);
    }

    public record Result(List<Notification> notifications, int unreadCount) {
    }
}