package edu.tlu.jobplatform.application.usecase.candidate;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GetMyApplicationsUseCase {

    private final ApplicationRepository applicationRepo;

    @Transactional(readOnly = true)
    public Page<Application> execute(UUID candidateId, Pageable pageable) {
        return applicationRepo.findByCandidateId(candidateId, pageable);
    }
}