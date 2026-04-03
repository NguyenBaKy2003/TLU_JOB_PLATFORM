package edu.tlu.jobplatform.job.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * Skill yêu cầu của bài đăng.
 * Thuộc về JobPost aggregate — không có lifecycle riêng.
 */
@Getter
@Builder
public class JobPostSkill {

    private final UUID id;
    private final UUID jobPostId;
    private final String skillName;
    private final String level;
    private final boolean required;
}