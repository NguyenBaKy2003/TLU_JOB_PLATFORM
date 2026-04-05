package edu.tlu.jobplatform.notification.infrastructure.persistence.mapper;

import edu.tlu.jobplatform.notification.domain.model.Notification;
import edu.tlu.jobplatform.notification.infrastructure.persistence.entity.NotificationJpaEntity;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public Notification toDomain(NotificationJpaEntity e) {
        return Notification.builder()
                .id(e.getId())
                .userId(e.getUserId())
                .recipientEmail(e.getRecipientEmail())
                .emailRequired(e.isEmailRequired())
                .type(e.getType())
                .title(e.getTitle())
                .body(e.getBody())
                .link(e.getLink())
                .read(e.isRead())
                .readAt(e.getReadAt())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    public NotificationJpaEntity toEntity(Notification d) {
        NotificationJpaEntity entity = NotificationJpaEntity.builder()
                .userId(d.getUserId())
                .recipientEmail(d.getRecipientEmail())
                .emailRequired(d.isEmailRequired())
                .type(d.getType())
                .title(d.getTitle())
                .body(d.getBody())
                .link(d.getLink())
                .read(d.isRead())
                .readAt(d.getReadAt())
                .build();

        // Preserve id nếu là update
        if (d.getId() != null) {
            entity.setId(d.getId());
        }
        return entity;
    }
}