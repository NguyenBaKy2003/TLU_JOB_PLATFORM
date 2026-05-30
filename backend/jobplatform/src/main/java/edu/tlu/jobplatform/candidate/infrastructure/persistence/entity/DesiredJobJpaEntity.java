package edu.tlu.jobplatform.candidate.infrastructure.persistence.entity;

import edu.tlu.jobplatform.candidate.domain.model.DesiredJob.ContractType;
import edu.tlu.jobplatform.candidate.domain.model.DesiredJob.Level;
import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "desired_jobs", indexes = {
        @Index(name = "idx_desired_job_profile_id", columnList = "profile_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesiredJobJpaEntity extends BaseJpaEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private CandidateProfileJpaEntity profile;

    @Column(length = 255)
    private String industry;

    @Column(name = "min_salary")
    private int minSalary;

    @Column(length = 10)
    private String currency;

    @ElementCollection
    @CollectionTable(name = "desired_job_contract_types", joinColumns = @JoinColumn(name = "desired_job_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "contract_type", length = 20)
    @Builder.Default
    private Set<ContractType> contractTypes = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "desired_job_levels", joinColumns = @JoinColumn(name = "desired_job_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "level", length = 20)
    @Builder.Default
    private Set<Level> levels = new HashSet<>();
}