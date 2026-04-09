package edu.tlu.jobplatform.application.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.application.domain.model.ApplicationStatusLog;
import edu.tlu.jobplatform.application.domain.repository.ApplicationStatusLogRepository;
import edu.tlu.jobplatform.application.infrastructure.persistence.entity.ApplicationStatusLogJpaEntity;
import edu.tlu.jobplatform.application.infrastructure.persistence.repository.ApplicationStatusLogJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ApplicationStatusLogRepositoryAdapter implements ApplicationStatusLogRepository {

        private final ApplicationStatusLogJpaRepository jpaRepo;

        @Override
        public List<ApplicationStatusLog> findByApplicationId(UUID applicationId) {
                return jpaRepo.findByApplicationIdOrderByChangedAtAsc(applicationId)
                                .stream().map(e -> ApplicationStatusLog.builder()
                                                .id(e.getId()).applicationId(e.getApplicationId())
                                                .fromStatus(e.getFromStatus()).toStatus(e.getToStatus())
                                                .note(e.getNote()).changedBy(e.getChangedBy())
                                                .changedAt(e.getChangedAt())
                                                .build())
                                .toList();
        }

        @Override
        public ApplicationStatusLog save(ApplicationStatusLog log) {
                ApplicationStatusLogJpaEntity e = ApplicationStatusLogJpaEntity.builder()
                                .applicationId(log.getApplicationId()).fromStatus(log.getFromStatus())
                                .toStatus(log.getToStatus()).note(log.getNote())
                                .changedBy(log.getChangedBy()).changedAt(log.getChangedAt())
                                .build();
                ApplicationStatusLogJpaEntity saved = jpaRepo.save(e);
                return ApplicationStatusLog.builder()
                                .id(saved.getId()).applicationId(saved.getApplicationId())
                                .fromStatus(saved.getFromStatus()).toStatus(saved.getToStatus())
                                .note(saved.getNote()).changedBy(saved.getChangedBy()).changedAt(saved.getChangedAt())
                                .build();
        }
}