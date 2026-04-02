package edu.tlu.jobplatform.job.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * SavedJob — ứng viên lưu tin tuyển dụng yêu thích.
 *
 * Simple entity, không có business logic phức tạp.
 * Constraint unique: (candidateId, jobPostId).
 */
@Getter
@Builder
public class SavedJob {

    private final UUID id;
    private final UUID candidateId;
    private final UUID jobPostId;
    private final LocalDateTime savedAt;
}