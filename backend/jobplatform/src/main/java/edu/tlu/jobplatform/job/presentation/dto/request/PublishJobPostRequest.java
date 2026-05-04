package edu.tlu.jobplatform.job.presentation.dto.request;

public record PublishJobPostRequest(
        boolean featured) {
    public PublishJobPostRequest() {
        this(false);
    }
}