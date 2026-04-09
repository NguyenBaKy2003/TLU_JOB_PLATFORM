package edu.tlu.jobplatform.application.infrastructure.adapter;

import edu.tlu.jobplatform.application.domain.model.vo.AIScore;
import edu.tlu.jobplatform.application.usecase.port.out.AIScorePort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;
import java.util.UUID;

/**
 * Mock AI Score Adapter — Sprint 4.
 * Sprint 5: Thay bằng OpenAIScoreAdapter dùng Spring AI.
 */
@Slf4j
@Component
public class MockAIScoreAdapter implements AIScorePort {

    private final Random random = new Random();

    @Override
    public AIScore calculateScore(UUID applicationId, String cvUrl, String jobFullText) {
        log.debug("[MOCK AI] Calculating score for application={}", applicationId);

        // Simulate delay
        try {
            Thread.sleep(500);
        } catch (InterruptedException ignored) {
        }

        int score = 50 + random.nextInt(50); // 50-100
        return AIScore.builder()
                .score(score)
                .skillMatchScore(40 + random.nextInt(60))
                .experienceScore(40 + random.nextInt(60))
                .educationScore(40 + random.nextInt(60))
                .strengths(List.of("Có kinh nghiệm Java", "Thành thạo Spring Boot"))
                .gaps(score < 70 ? List.of("Thiếu kinh nghiệm Docker") : List.of())
                .summary("Ứng viên có " + score + "/100 điểm phù hợp với vị trí.")
                .modelVersion("mock-v1.0")
                .build();
    }
}