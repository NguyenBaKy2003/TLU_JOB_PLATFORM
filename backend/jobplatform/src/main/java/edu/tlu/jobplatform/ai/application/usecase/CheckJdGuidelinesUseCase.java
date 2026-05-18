package edu.tlu.jobplatform.ai.application.usecase;

import edu.tlu.jobplatform.ai.domain.model.JdGuidelineCheckRequest;
import edu.tlu.jobplatform.ai.domain.model.JdGuidelineCheckResult;
import edu.tlu.jobplatform.ai.domain.port.JdGuidelineCheckPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.UUID;

import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CheckJdGuidelinesUseCase {

        private final JdGuidelineCheckPort guidelinePort;

        public JdGuidelineCheckResult execute(Command cmd) {
                JdGuidelineCheckRequest request = JdGuidelineCheckRequest.builder()
                                .jobPostId(cmd.jobPostId())
                                .title(cmd.title())
                                .description(cmd.description())
                                .requirements(cmd.requirements())
                                .benefits(cmd.benefits())
                                .build();

                JdGuidelineCheckResult result = guidelinePort.check(request);

                // Optional: lưu kết quả để audit
                log.info("JD check done: jobPostId={} severity={} score={}",
                                cmd.jobPostId(), result.getSeverity(), result.getQualityScore());

                return result;
        }

        public record Command(
                        UUID jobPostId,
                        String title, String description,
                        String requirements, String benefits) {
        }
}