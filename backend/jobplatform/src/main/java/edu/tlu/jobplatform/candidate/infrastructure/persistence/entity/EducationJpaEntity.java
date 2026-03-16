package edu.tlu.jobplatform.candidate.infrastructure.persistence.entity;

import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "educations", indexes = {
        @Index(name = "idx_education_profile_id", columnList = "profile_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EducationJpaEntity extends BaseJpaEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private CandidateProfileJpaEntity profile;

    @Column(nullable = false, length = 255)
    private String school;

    @Column(length = 255)
    private String major;

    @Column(length = 20)
    private String degree;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(columnDefinition = "TEXT")
    private String description;
}