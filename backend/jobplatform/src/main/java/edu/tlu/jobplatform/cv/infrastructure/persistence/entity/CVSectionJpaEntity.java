package edu.tlu.jobplatform.cv.infrastructure.persistence.entity;

import edu.tlu.jobplatform.cv.domain.model.vo.SectionType;
import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cv_sections", indexes = {
        @Index(name = "idx_cv_sections_cv_id", columnList = "cv_id"),
        @Index(name = "idx_cv_sections_order", columnList = "cv_id, display_order")
})
@Getter
@Setter
@NoArgsConstructor
public class CVSectionJpaEntity extends BaseJpaEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cv_id", nullable = false)
    private OnlineCVJpaEntity cv;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private SectionType type;

    @Column(name = "title", length = 150)
    private String title;

    /**
     * Nội dung JSON — schema tuỳ theo type.
     * Dùng TEXT để không giới hạn độ dài.
     */
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @Column(name = "visible", nullable = false)
    private boolean visible = true;
}