package edu.tlu.jobplatform.company.infrastructure.persistence.entity;

import edu.tlu.jobplatform.company.domain.model.CompanySize;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "company_profiles", indexes = {
        @Index(name = "idx_company_owner", columnList = "owner_id", unique = true),
        @Index(name = "idx_company_slug", columnList = "slug", unique = true),
        @Index(name = "idx_company_status", columnList = "verification_status"),
        @Index(name = "idx_company_name", columnList = "name")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyJpaEntity extends BaseJpaEntity {

    @Column(name = "owner_id", nullable = false, unique = true)
    private UUID ownerId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, unique = true, length = 250)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String website;

    @Column(length = 255)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 500)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String country;

    @Column(length = 100)
    private String industry;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CompanySize size;

    @Column(name = "founded_year")
    private Integer foundedYear;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 20)
    private VerificationStatus verificationStatus;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "verified_by")
    private UUID verifiedBy;
}