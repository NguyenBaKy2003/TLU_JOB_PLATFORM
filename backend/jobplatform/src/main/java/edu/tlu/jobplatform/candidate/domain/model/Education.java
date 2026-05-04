package edu.tlu.jobplatform.candidate.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class Education {

    private final UUID id;
    private String school;
    private String major;
    private String degree; // "BACHELOR" | "MASTER" | "PHD" | "OTHER"
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;

    public void update(String school, String major, String degree,
            LocalDate startDate, LocalDate endDate, String description) {
        this.school = school;
        this.major = major;
        this.degree = degree;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
    }
}