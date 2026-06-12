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
    private final String levelSummary; // "3 năm Java, 1 năm K8s"
    private final String educationSummary; // "Đại học BKHN - CNTT"
    private final int totalExperienceYears;
}