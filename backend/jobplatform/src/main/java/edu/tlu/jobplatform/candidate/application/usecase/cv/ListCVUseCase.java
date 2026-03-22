package edu.tlu.jobplatform.candidate.application.usecase.cv;

import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateCVRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ListCVUseCase {

    private final CandidateCVRepository cvRepository;

    @Transactional(readOnly = true)
    public List<CandidateCV> execute(UUID candidateId) {
        return cvRepository.findAllByCandidateId(candidateId);
    }
}