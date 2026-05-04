package edu.tlu.jobplatform.user.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@NoArgsConstructor
public class NotificationPreferencesJpaEntity {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "new_jobs")
    private boolean newJobs = true;

    @Column(name = "applications")
    private boolean applications = true;

    @Column(name = "messages")
    private boolean messages = true;
}
