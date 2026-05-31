package edu.tlu.jobplatform.livestream.application.usecase.employer;

import edu.tlu.jobplatform.livestream.domain.model.StreamAnalytics;
import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.livestream.domain.repository.StreamAnalyticsRepository;
import edu.tlu.jobplatform.livestream.presentation.dto.response.StreamAnalyticsResponse;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetStreamAnalyticsUseCase {

    private final StreamAnalyticsRepository analyticsRepository;
    private final LiveStreamSessionRepository sessionRepository;

    public StreamAnalyticsResponse execute(UUID sessionId, UUID companyId) {
        // Kiểm tra session thuộc company
        sessionRepository.findById(sessionId)
                .filter(s -> companyId.equals(s.getCompanyId()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy phiên stream: " + sessionId));

        StreamAnalytics analytics = analyticsRepository
                .findBySessionId(sessionId)
                .orElseGet(() -> StreamAnalytics.createFor(sessionId));

        return StreamAnalyticsResponse.from(analytics);
    }
}