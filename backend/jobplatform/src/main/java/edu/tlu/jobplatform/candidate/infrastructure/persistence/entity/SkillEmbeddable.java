package edu.tlu.jobplatform.candidate.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillEmbeddable {

    @Column(name = "skill_name", length = 100)
    private String name;

    @Column(name = "skill_level", length = 20)
    private String level;

    @Column(name = "years_of_exp")
    private int yearsOfExp;
}