package edu.tlu.jobplatform.cv.infrastructure.persistence.entity;

import edu.tlu.jobplatform.shared.base.BaseJpaEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cv_templates")
@Getter
@Setter
@NoArgsConstructor
public class CVTemplateJpaEntity extends BaseJpaEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "is_premium", nullable = false)
    private boolean premium;

    /** Tên file Thymeleaf, VD: "cv-template-classic" */
    @Column(name = "thymeleaf_template", nullable = false, length = 100)
    private String thymeleafTemplate;
}