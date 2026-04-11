package edu.tlu.jobplatform.ai.usecase;

import edu.tlu.jobplatform.ai.domain.model.JdOptimizationRequest;
import edu.tlu.jobplatform.ai.domain.model.JdOptimizationResult;
import edu.tlu.jobplatform.ai.domain.port.JdOptimizationPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class OptimizeJdUseCase {

    private final JdOptimizationPort optimizationPort;

    public JdOptimizationResult execute(Command cmd) {
        return optimizationPort.optimize(JdOptimizationRequest.builder()
            .originalTitle(cmd.title())
            .originalDescription(cmd.description())
            .originalRequirements(cmd.requirements())
            .level(cmd.level())
            .category(cmd.category())
            .build());
    }

    public record Command(
        String title, String description, String requirements,
        String level, String category) {}
}
