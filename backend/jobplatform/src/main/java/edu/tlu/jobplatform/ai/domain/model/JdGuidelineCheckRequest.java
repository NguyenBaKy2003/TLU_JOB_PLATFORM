
// JdGuidelineCheckRequest.java
package edu.tlu.jobplatform.ai.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class JdGuidelineCheckRequest {
    private final UUID jobPostId;
    private final String title;
    private final String description;
    private final String requirements;
    private final String benefits;
}