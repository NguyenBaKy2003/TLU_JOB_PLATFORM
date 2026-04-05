package edu.tlu.jobplatform.notification.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.notification.domain.model.Notification;
import edu.tlu.jobplatform.notification.domain.repository.NotificationRepository;
import edu.tlu.jobplatform.notification.infrastructure.persistence.mapper.NotificationMapper;
import edu.tlu.jobplatform.notification.infrastructure.persistence.repository.NotificationJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class NotificationRepositoryAdapter implements NotificationRepository {

    private final NotificationJpaRepository jpa;
    private final NotificationMapper mapper;

    @Override
    public Notification save(Notification n) {
        return mapper.toDomain(jpa.save(mapper.toEntity(n)));
    }

    @Override
    public Optional<Notification> findById(UUID id) {
        return jpa.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Notification> findByUserId(UUID userId, int page, int size) {
        return jpa.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public int countUnreadByUserId(UUID userId) {
        return jpa.countByUserIdAndReadFalse(userId);
    }

    @Override
    public int markAllReadByUserId(UUID userId) {
        return jpa.markAllReadByUserId(userId);
    }

    @Override
    public void deleteById(UUID id) {
        jpa.deleteById(id);
    }
}