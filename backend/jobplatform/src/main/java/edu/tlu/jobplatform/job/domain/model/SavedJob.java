package edu.tlu.jobplatform.job.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

/** Ứng viên lưu bài đăng yêu thích */
@Getter
@Builder
public class SavedJob {

    private final UUID id;
    private final UUID candidateId;
    private final UUID jobPostId;
    private final LocalDateTime savedAt;
}