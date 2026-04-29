package edu.tlu.jobplatform.livestream.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.livestream.domain.model.*;
import edu.tlu.jobplatform.livestream.domain.model.vo.SessionStatus;
import edu.tlu.jobplatform.livestream.domain.repository.LiveStreamSessionRepository;
import edu.tlu.jobplatform.livestream.infrastructure.persistence.mapper.LiveStreamMapper;
import edu.tlu.jobplatform.livestream.infrastructure.persistence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

// ─── LiveStreamSession Adapter ───────────────────────────────
@Component
@RequiredArgsConstructor
public class LiveStreamSessionRepositoryAdapter implements LiveStreamSessionRepository {

    private final LiveStreamSessionJpaRepository jpaRepository;
    private final LiveStreamMapper mapper;

    @Override
    public LiveStreamSession save(LiveStreamSession session) {
        var saved = jpaRepository.save(mapper.toJpa(session));
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<LiveStreamSession> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<LiveStreamSession> findByCompanyId(UUID companyId) {
        return jpaRepository.findByCompanyId(companyId)
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<LiveStreamSession> findUpcoming(LocalDateTime from, LocalDateTime to) {
        return jpaRepository.findUpcoming(from, to)
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<LiveStreamSession> findByStatus(SessionStatus status) {
        return jpaRepository.findByStatus(status)
                .stream().map(mapper::toDomain).toList();
    }

    @Override
    public void deleteById(UUID id) {
        jpaRepository.deleteById(id);
    }

    /**
     * Lấy danh sách phiên cho Candidate:
     * - Tất cả phiên đang LIVE
     * - Phiên SCHEDULED trong khoảng thời gian
     * Sắp xếp: LIVE trước, sau đó SCHEDULED theo thời gian gần nhất
     */
    @Override
    public List<LiveStreamSession> findUpcomingAndLive(LocalDateTime from, LocalDateTime to) {
        return jpaRepository.findUpcomingAndLive(from, to)
                .stream()
                .map(mapper::toDomain)
                .toList();
    }
}