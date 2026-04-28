package edu.tlu.jobplatform.auth.candidate.application.usecase.cv;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.tlu.jobplatform.auth.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.auth.candidate.domain.repository.CandidateCVRepository;

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