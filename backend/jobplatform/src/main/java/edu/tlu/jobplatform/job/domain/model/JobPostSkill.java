package edu.tlu.jobplatform.job.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

/**
 * JobPostSkill — kỹ năng yêu cầu của một tin tuyển dụng.
 *
 * Thuộc về aggregate JobPost (không có vòng đời độc lập).
 * required = false → "ưu tiên có", không bắt buộc.
 */
@Getter
@Builder
public class JobPostSkill {

    private final UUID id;
    private final UUID jobPostId;
    private final String skillName; // "Java", "Spring Boot", "AWS"
    private final boolean required; // bắt buộc hay chỉ ưu tiên
    private final int yearsRequired; // số năm kinh nghiệm tối thiểu (0 = không yêu cầu)
}