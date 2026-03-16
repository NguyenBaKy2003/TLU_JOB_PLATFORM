package edu.tlu.jobplatform.candidate.presentation.dto.response;

import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.candidate.domain.model.CandidateCV.CVType;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class CVResponse {

    private UUID id;
    private String title;
    private CVType type;
    private String fileUrl;
    private boolean primary;
    private boolean hasContent; // parsedContent != null (không trả content thô)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CVResponse from(CandidateCV cv) {
        return CVResponse.builder()
                .id(cv.getId())
                .title(cv.getTitle())
                .type(cv.getType())
                .fileUrl(cv.getFileUrl())
                .primary(cv.isPrimary())
                .hasContent(cv.getParsedContent() != null
                        && !cv.getParsedContent().isBlank())
                .createdAt(cv.getCreatedAt())
                .updatedAt(cv.getUpdatedAt())
                .build();
    }
}