package edu.tlu.jobplatform.livestream.application.usecase.candidate;

import edu.tlu.jobplatform.livestream.domain.model.LiveStreamSession;
import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

// ============================================================
// GetUpcomingStreamsUseCase (Marketplace)
// ============================================================
@Service
@RequiredArgsConstructor
public class GetUpcomingStreamsUseCase {

    private final LiveStreamSessionRepository sessionRepository;

    /**
     * Lấy danh sách tất cả phiên stream chưa kết thúc:
     * - SCHEDULED: các phiên trong 7 ngày tới
     * - LIVE: các phiên đang phát trực tiếp
     * Sắp xếp: LIVE trước, sau đó SCHEDULED theo thời gian gần nhất
     */
    public List<LiveStreamSession> execute() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime next7Days = now.plusDays(7);
        return sessionRepository.findUpcomingAndLive(now, next7Days);
    }
}