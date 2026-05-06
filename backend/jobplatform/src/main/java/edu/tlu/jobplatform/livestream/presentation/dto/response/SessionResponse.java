package edu.tlu.jobplatform.livestream.presentation.dto.response;

import edu.tlu.jobplatform.livestream.domain.model.*;
import edu.tlu.jobplatform.livestream.domain.model.vo.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

//  SessionResponse (list view) ──
public record SessionResponse(
        UUID id,
        UUID companyId,
        UUID hostUserId,
        String title,
        String description,
        String thumbnailUrl,
        SessionType sessionType,
        SessionStatus status,
        LocalDateTime scheduledAt,
        LocalDateTime startedAt,
        LocalDateTime endedAt,
        int maxViewers,
        int viewerCount,
        boolean quotaConsumed,
        List<InterviewSlot> interviewSlots) {
    public static SessionResponse from(LiveStreamSession s) {
        return new SessionResponse(
                s.getId(),
                s.getCompanyId(),
                s.getHostUserId(),
                s.getTitle(),
                s.getDescription(),
                s.getThumbnailUrl(),
                s.getSessionType(),
                s.getStatus(),
                s.getScheduledAt(),
                s.getStartedAt(),
                s.getEndedAt(),
                s.getMaxViewers(),
                s.getViewerCount(),
                s.isQuotaConsumed(),
                s.getInterviewSlots());
    }
}