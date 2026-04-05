package edu.tlu.jobplatform.shared.base;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseJpaEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public void softDelete() {
        this.isActive = false;
    }

    public boolean isActive() {
        return Boolean.TRUE.equals(this.isActive);
    }

    @PrePersist
    protected void prePersist() {
        if (this.id == null)
            this.id = UUID.randomUUID();
        if (this.createdAt == null)
            this.createdAt = LocalDateTime.now();
        if (this.updatedAt == null)
            this.updatedAt = LocalDateTime.now();
        if (this.createdBy == null)
            this.createdBy = "system";
        if (this.isActive == null)
            this.isActive = true;
    }

    @PreUpdate
    protected void preUpdate() {
        if (this.updatedAt == null)
            this.updatedAt = LocalDateTime.now();
    }
}