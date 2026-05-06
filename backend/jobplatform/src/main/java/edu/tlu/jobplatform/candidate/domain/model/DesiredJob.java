// ── DesiredJob.java 
package edu.tlu.jobplatform.candidate.domain.model;

import lombok.Builder;
import lombok.Getter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class DesiredJob {

    public enum ContractType {
        FULL_TIME, PART_TIME, REMOTE, INTERNSHIP
    }

    public enum Level {
        FRESHER, JUNIOR, SENIOR, MANAGER, DIRECTOR
    }

    private final UUID id;
    private String industry;
    private int minSalary;
    private String currency;

    @Builder.Default
    private List<ContractType> contractTypes = new ArrayList<>();

    @Builder.Default
    private List<Level> levels = new ArrayList<>();

    public static DesiredJob of(String industry, int minSalary, String currency,
            List<ContractType> contractTypes, List<Level> levels) {
        return DesiredJob.builder()
                .id(UUID.randomUUID())
                .industry(industry)
                .minSalary(minSalary)
                .currency(currency)
                .contractTypes(contractTypes)
                .levels(levels)
                .build();
    }
}