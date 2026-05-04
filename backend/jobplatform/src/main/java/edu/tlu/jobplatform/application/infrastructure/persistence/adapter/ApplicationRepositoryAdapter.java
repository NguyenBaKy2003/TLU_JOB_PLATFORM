package edu.tlu.jobplatform.application.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.vo.AIScore;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.application.infrastructure.persistence.entity.ApplicationJpaEntity;
import edu.tlu.jobplatform.application.infrastructure.persistence.repository.ApplicationJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ApplicationRepositoryAdapter implements ApplicationRepository {

    private final ApplicationJpaRepository jpaRepo;

    // ── Existing methods ──────────

    @Override
    public Optional<Application> findById(UUID id) {
        return jpaRepo.findById(id).map(this::toDomain);
    }

    @Override
    public boolean existsById(UUID id) {
        return jpaRepo.existsById(id);
    }

    @Override
    public boolean existsByJobPostIdAndCandidateId(UUID jid, UUID cid) {
        return jpaRepo.existsByJobPostIdAndCandidateId(jid, cid);
    }

    @Override
    public Page<Application> findByCandidateId(UUID cid, Pageable p) {
        return jpaRepo.findByCandidateId(cid, p).map(this::toDomain);
    }

    @Override
    public Page<Application> findByJobPostId(UUID jid, Pageable p) {
        return jpaRepo.findByJobPostId(jid, p).map(this::toDomain);
    }

    @Override
    public Page<Application> findByJobPostIdAndStatus(UUID jid, ApplicationStatus s, Pageable p) {
        return jpaRepo.findByJobPostIdAndStatus(jid, s, p).map(this::toDomain);
    }

    @Override
    public Page<Application> findByCompanyId(UUID companyId, Pageable pageable) {
        return jpaRepo.findByCompanyId(companyId, pageable).map(this::toDomain);
    }

    @Override
    public Page<Application> findByCompanyId(UUID companyId, ApplicationStatus status, Pageable pageable) {
        if (status != null) {
            return jpaRepo.findByCompanyIdAndStatus(companyId, status, pageable).map(this::toDomain);
        }
        return jpaRepo.findByCompanyId(companyId, pageable).map(this::toDomain);
    }

    @Override
    public Optional<Application> findByJobPostIdAndCandidateId(UUID jid, UUID cid) {
        return jpaRepo.findByJobPostIdAndCandidateId(jid, cid).map(this::toDomain);
    }

    @Override
    public Application save(Application app) {
        if (app.getId() != null) {
            Optional<ApplicationJpaEntity> existing = jpaRepo.findById(app.getId());
            if (existing.isPresent()) {
                ApplicationJpaEntity e = existing.get();
                updateEntity(e, app);
                return toDomain(jpaRepo.save(e));
            }
        }
        return toDomain(jpaRepo.save(toNewEntity(app)));
    }

    @Override
    public long countAll() {
        return jpaRepo.count();
    }

    // ── Search methods ────────────

    /**
     * Chuẩn hoá keyword: null/blank → null (JPQL sẽ bỏ qua điều kiện search).
     */
    private String normalizeKeyword(String keyword) {
        return StringUtils.hasText(keyword) ? keyword.trim() : null;
    }

    @Override
    public Page<Application> searchAll(ApplicationStatus status, String keyword, Pageable pageable) {
        return jpaRepo.searchAll(status, normalizeKeyword(keyword), pageable)
                .map(this::toDomain);
    }

    @Override
    public Page<Application> searchByCompanyId(
            UUID companyId, ApplicationStatus status, String keyword, Pageable pageable) {
        return jpaRepo.searchByCompanyId(companyId, status, normalizeKeyword(keyword), pageable)
                .map(this::toDomain);
    }

    @Override
    public Page<Application> searchByJobPostId(
            UUID jobPostId, ApplicationStatus status, String keyword, Pageable pageable) {
        return jpaRepo.searchByJobPostId(jobPostId, status, normalizeKeyword(keyword), pageable)
                .map(this::toDomain);
    }

    // ── Mappers

    private Application toDomain(ApplicationJpaEntity e) {
        AIScore score = null;
        if (e.isAiScoreCalculated() && e.getAiScore() != null) {
            score = AIScore.builder()
                    .score(e.getAiScore())
                    .skillMatchScore(e.getAiSkillMatchScore() != null ? e.getAiSkillMatchScore() : 0)
                    .experienceScore(e.getAiExperienceScore() != null ? e.getAiExperienceScore() : 0)
                    .educationScore(e.getAiEducationScore() != null ? e.getAiEducationScore() : 0)
                    .summary(e.getAiSummary())
                    .modelVersion(e.getAiModelVersion())
                    .build();
        }
        return Application.builder()
                .id(e.getId()).jobPostId(e.getJobPostId())
                .candidateId(e.getCandidateId()).companyId(e.getCompanyId())
                .cvUrl(e.getCvUrl()).coverLetter(e.getCoverLetter())
                .expectedSalary(e.getExpectedSalary()).status(e.getStatus())
                .rejectionReason(e.getRejectionReason())
                .interviewScheduledAt(e.getInterviewScheduledAt())
                .interviewLocation(e.getInterviewLocation())
                .interviewNote(e.getInterviewNote())
                .aiScore(score).aiScoreCalculated(e.isAiScoreCalculated())
                .appliedAt(e.getAppliedAt()).updatedAt(e.getUpdatedAt())
                .build();
    }

    private ApplicationJpaEntity toNewEntity(Application d) {
        return ApplicationJpaEntity.builder()
                .jobPostId(d.getJobPostId()).candidateId(d.getCandidateId())
                .companyId(d.getCompanyId()).cvUrl(d.getCvUrl())
                .coverLetter(d.getCoverLetter()).expectedSalary(d.getExpectedSalary())
                .status(d.getStatus()).appliedAt(d.getAppliedAt())
                .aiScoreCalculated(false).build();
    }

    private void updateEntity(ApplicationJpaEntity e, Application d) {
        e.setStatus(d.getStatus());
        e.setRejectionReason(d.getRejectionReason());
        e.setInterviewScheduledAt(d.getInterviewScheduledAt());
        e.setInterviewLocation(d.getInterviewLocation());
        e.setInterviewNote(d.getInterviewNote());
        e.setAiScoreCalculated(d.isAiScoreCalculated());
        if (d.getAiScore() != null) {
            AIScore s = d.getAiScore();
            e.setAiScore(s.getScore());
            e.setAiSkillMatchScore(s.getSkillMatchScore());
            e.setAiExperienceScore(s.getExperienceScore());
            e.setAiEducationScore(s.getEducationScore());
            e.setAiSummary(s.getSummary());
            e.setAiModelVersion(s.getModelVersion());
        }
    }
}