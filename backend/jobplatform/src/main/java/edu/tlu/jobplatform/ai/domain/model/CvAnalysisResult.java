package edu.tlu.jobplatform.ai.domain.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonPOJOBuilder;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder(toBuilder = true)
@JsonDeserialize(builder = CvAnalysisResult.CvAnalysisResultBuilder.class)
public class CvAnalysisResult {

    private final Integer overallScore;
    private final Integer skillMatchScore;
    private final Integer experienceScore;
    private final Integer educationScore;
    private final List<String> strengths;
    private final List<String> gaps;
    private final String summary;

    @JsonPOJOBuilder(withPrefix = "")
    public static class CvAnalysisResultBuilder {
    }
}