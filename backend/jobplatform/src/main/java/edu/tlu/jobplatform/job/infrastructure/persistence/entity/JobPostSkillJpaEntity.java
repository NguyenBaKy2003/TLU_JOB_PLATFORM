package edu.tlu.jobplatform.job.infrastructure.persistence.entity;

import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "job_post_skills", indexes = @Index(name = "idx_skill_job", columnList = "job_post_id"))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobPostSkillJpaEntity extends BaseJpaEntity {

    @Column(name = "job_post_id", nullable = false)
    private UUID jobPostId;

    @Column(name = "skill_name", nullable = false, length = 100)
    private String skillName;

    @Column(length = 30)
    private String level;

    @Column(nullable = false)
    private boolean required;
}