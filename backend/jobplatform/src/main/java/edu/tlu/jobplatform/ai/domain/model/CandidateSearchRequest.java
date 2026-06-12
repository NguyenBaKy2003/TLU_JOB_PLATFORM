package edu.tlu.jobplatform.ai.domain.model;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class CandidateSearchRequest {
    private final UUID employerId;
    private final UUID jobPostId; // optional — tìm cho JD cụ thể
    private final String naturalQuery; // "Tìm Java senior 3 năm, biết K8s, HCM"
    private final String jobTitle;
    private final String jobRequirements;
    private final String jobLevel;
    private final String location;
    private final List<String> requiredSkills; // ← skill có cấu trúc từ JobPostSkill
    private final int maxResults; // dùng để tính matched/missing chính xác
}