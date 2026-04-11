package edu.tlu.jobplatform.ai.domain.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class JdOptimizationResult {

    @JsonProperty("improvedTitle")
    private String improvedTitle;

    @JsonProperty("improvedDescription")
    private String improvedDescription;

    @JsonProperty("improvedRequirements")
    private String improvedRequirements;

    @JsonProperty("suggestions")
    private List<String> suggestions;

    @JsonProperty("qualityScore")
    private int qualityScore;
}
