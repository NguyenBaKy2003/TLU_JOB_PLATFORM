package edu.tlu.jobplatform.candidate.application.usecase.cv;

import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateCVRepository;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ListAllCVsUseCase {

    private final CandidateCVRepository uploadedCVRepository;
    private final OnlineCVRepository onlineCVRepository;

    public record Result(
            List<CandidateCV> uploadedCVs,
            List<OnlineCV> onlineCVs) {
    }

    public Result execute(UUID candidateId) {
        List<CandidateCV> uploaded = uploadedCVRepository.findAllByCandidateId(candidateId);
        List<OnlineCV> online = onlineCVRepository.findAllByCandidateId(candidateId);
        return new Result(uploaded, online);
    }
}