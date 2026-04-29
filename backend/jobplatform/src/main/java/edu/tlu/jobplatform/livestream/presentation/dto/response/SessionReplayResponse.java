package edu.tlu.jobplatform.livestream.presentation.dto.response;

import edu.tlu.jobplatform.livestream.domain.model.vo.*;

import java.util.List;
import java.util.UUID;

// ─── SessionReplayResponse ────────────────────────────────────
public record SessionReplayResponse(
        UUID sessionId,
        String title,
        String videoUrl,
        int durationSeconds,
        String aiSummary,
        List<String> topQuestions,
        List<String> keyTopics,
        AISummaryStatus aiSummaryStatus,
        boolean hasApplyCTA) {
}
