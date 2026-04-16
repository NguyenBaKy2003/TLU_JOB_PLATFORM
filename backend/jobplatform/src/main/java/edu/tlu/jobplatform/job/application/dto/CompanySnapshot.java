package edu.tlu.jobplatform.job.application.dto;

import java.util.UUID;

public record CompanySnapshot(
        UUID id,
        String name,
        String logoUrl,
        String industry,
        String size,
        String website) {
}