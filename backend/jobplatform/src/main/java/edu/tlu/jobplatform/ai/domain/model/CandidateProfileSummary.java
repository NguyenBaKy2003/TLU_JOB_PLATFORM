package edu.tlu.jobplatform.ai.domain.model;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class CandidateProfileSummary {
    private final UUID id;
    private final String fullName;
    private final String headline;
    private final String location;
    private final String jobSearchStatus;
    private final List<String> skills;
    private final String levelSummary; // cấp độ mong muốn, VD "MID/SENIOR"
    private final String educationSummary; // TẤT CẢ học vấn, VD "BACHELOR - CNTT (BKHN); MASTER - QTKD (FTU)"
    private final String experienceDetails; // chi tiết từng công việc: vị trí, công ty, thời gian, mô tả
    private final int totalExperienceYears; // tính từ ngày start/end thực tế của các kinh nghiệm
}