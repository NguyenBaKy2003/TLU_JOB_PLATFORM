package edu.tlu.jobplatform.candidate.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class WorkExperience {

    private final UUID id;
    private String companyName;
    private String position;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate; // null = đang làm
    private boolean current;

    public boolean isCurrent() {
        return current || endDate == null;
    }

    public void update(String companyName, String position,
            String description, LocalDate startDate,
            LocalDate endDate, boolean current) {
        this.companyName = companyName;
        this.position = position;
        this.description = description;
        this.startDate = startDate;
        this.endDate = current ? null : endDate;
        this.current = current;
    }
}