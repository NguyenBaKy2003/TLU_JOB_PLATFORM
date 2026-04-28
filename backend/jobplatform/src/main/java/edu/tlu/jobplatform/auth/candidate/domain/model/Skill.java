package edu.tlu.jobplatform.auth.candidate.domain.model;

import lombok.Builder;
import lombok.Getter;

/**
 * Value Object — không có identity riêng, so sánh bằng giá trị.
 * Immutable: một khi tạo ra không thay đổi được.
 */
@Getter
@Builder
public class Skill {

    private final String name; // "Java", "React", "Photoshop"
    private final String level; // "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
    private final int yearsOfExp; // số năm kinh nghiệm

    public static Skill of(String name, String level, int yearsOfExp) {
        if (name == null || name.isBlank())
            throw new IllegalArgumentException("Skill name must not be blank");
        return Skill.builder()
                .name(name.trim())
                .level(level)
                .yearsOfExp(Math.max(yearsOfExp, 0))
                .build();
    }
}