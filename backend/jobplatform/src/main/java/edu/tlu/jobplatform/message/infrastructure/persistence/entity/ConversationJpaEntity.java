package edu.tlu.jobplatform.message.infrastructure.persistence.entity;

import edu.tlu.jobplatform.message.domain.model.ConversationStatus;
import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "conversations", indexes = {
        @Index(name = "idx_conv_participant_a", columnList = "participant_a"),
        @Index(name = "idx_conv_participant_b", columnList = "participant_b"),
        @Index(name = "idx_conv_last_message", columnList = "last_message_at DESC"),
        @Index(name = "idx_conv_participants_job", columnList = "participant_a, participant_b, job_post_id", unique = true)
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationJpaEntity extends BaseJpaEntity {

    @Column(name = "participant_a", nullable = false)
    private UUID participantA;

    @Column(name = "participant_b", nullable = false)
    private UUID participantB;

    @Column(name = "job_post_id")
    private UUID jobPostId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ConversationStatus status;

    @Column(name = "last_message_preview", length = 200)
    private String lastMessagePreview;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "unread_count_a", nullable = false)
    private int unreadCountA;

    @Column(name = "unread_count_b", nullable = false)
    private int unreadCountB;
}