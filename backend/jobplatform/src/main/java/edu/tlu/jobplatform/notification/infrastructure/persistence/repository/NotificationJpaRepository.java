package edu.tlu.jobplatform.notification.infrastructure.persistence.repository;

import edu.tlu.jobplatform.notification.infrastructure.persistence.entity.NotificationJpaEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface NotificationJpaRepository extends JpaRepository<NotificationJpaEntity, UUID> {

    List<NotificationJpaEntity> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    int countByUserIdAndReadFalse(UUID userId);

    @Modifying
    @Query("""
            UPDATE NotificationJpaEntity n
            SET n.read = true, n.readAt = CURRENT_TIMESTAMP
            WHERE n.userId = :userId AND n.read = false
            """)
    int markAllReadByUserId(UUID userId);
}