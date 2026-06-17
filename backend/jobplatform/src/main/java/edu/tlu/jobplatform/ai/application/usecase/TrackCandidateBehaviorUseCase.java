package edu.tlu.jobplatform.ai.application.usecase;

import edu.tlu.jobplatform.ai.domain.model.SearchEvent;
import edu.tlu.jobplatform.ai.domain.port.SearchEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrackCandidateBehaviorUseCase {

        private final SearchEventRepository searchEventRepo;
        private final RedisTemplate<String, String> redisTemplate;

        @Async("aiTaskExecutor")
        public void trackSearch(UUID candidateId, String keyword) {
                if (keyword == null || keyword.isBlank())
                        return;
                save(SearchEvent.builder()
                                .id(UUID.randomUUID()).candidateId(candidateId)
                                .eventType(SearchEvent.EventType.SEARCH_QUERY)
                                .keyword(keyword.toLowerCase().trim())
                                .occurredAt(LocalDateTime.now()).build());

                String personalKey = "autocomplete:personal:" + candidateId;
                redisTemplate.opsForZSet().add(personalKey, keyword.toLowerCase(), System.currentTimeMillis());
                redisTemplate.opsForZSet().removeRange(personalKey, 0, -51);
                redisTemplate.expire(personalKey, Duration.ofDays(30));
                redisTemplate.opsForZSet().incrementScore("autocomplete:trending", keyword.toLowerCase(), 1);
        }

        @Async("aiTaskExecutor")
        public void trackJobView(UUID candidateId, UUID jobPostId, int dwellSeconds) {
                save(SearchEvent.builder()
                                .id(UUID.randomUUID()).candidateId(candidateId)
                                .eventType(dwellSeconds < 5
                                                ? SearchEvent.EventType.JOB_SKIP
                                                : SearchEvent.EventType.JOB_VIEW)
                                .jobPostId(jobPostId)
                                .dwellSeconds(dwellSeconds)
                                .occurredAt(LocalDateTime.now()).build());
        }

        @Async("aiTaskExecutor")
        public void trackJobSave(UUID candidateId, UUID jobPostId) {
                save(SearchEvent.builder()
                                .id(UUID.randomUUID()).candidateId(candidateId)
                                .eventType(SearchEvent.EventType.JOB_SAVE)
                                .jobPostId(jobPostId)
                                .occurredAt(LocalDateTime.now()).build());
        }

        @Async("aiTaskExecutor")
        public void trackJobApply(UUID candidateId, UUID jobPostId) {
                save(SearchEvent.builder()
                                .id(UUID.randomUUID()).candidateId(candidateId)
                                .eventType(SearchEvent.EventType.JOB_APPLY)
                                .jobPostId(jobPostId)
                                .occurredAt(LocalDateTime.now()).build());
        }

        public void trackCompanyView(UUID candidateId, UUID companyId) {
                String dedupeKey = "company_view:%s:%s".formatted(candidateId, companyId);

                Boolean isNew = redisTemplate.opsForValue()
                                .setIfAbsent(dedupeKey, "1", Duration.ofSeconds(30));

                if (!Boolean.TRUE.equals(isNew)) {
                        log.debug("Company view deduplicated: candidateId={}, companyId={}", candidateId, companyId);
                        return;
                }

                searchEventRepo.saveCompanyView(candidateId, companyId);
        }

        private void save(SearchEvent event) {
                try {
                        searchEventRepo.save(event);
                } catch (Exception e) {
                        log.warn("Failed to track event {}: {}", event.getEventType(), e.getMessage());
                }
        }
}