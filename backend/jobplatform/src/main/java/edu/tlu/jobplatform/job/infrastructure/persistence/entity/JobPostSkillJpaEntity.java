package edu.tlu.jobplatform.job.infrastructure.persistence.entity;

import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "job_post_skills", indexes = {
        @Index(name = "idx_skill_job", columnList = "job_post_id"),
        @Index(name = "idx_skill_name", columnList = "skill_name")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobPostSkillJpaEntity extends BaseJpaEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_post_id", nullable = false)
    private JobPostJpaEntity jobPost;

    @Column(name = "skill_name", nullable = false, length = 100)
    private String skillName;

    @Column(nullable = false)
    private boolean required;

    @Column(name = "years_required", nullable = false)
    private int yearsRequired;
}