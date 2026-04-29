package edu.tlu.jobplatform.livestream.presentation.dto.response;

public record SessionJoinResponse(
                String viewerToken,
                String livekitUrl,
                int currentViewerCount) {
}