package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * Lấy toàn bộ CV của candidate hiện tại (bao gồm DRAFT, PUBLISHED, ARCHIVED).
 * Sắp xếp: updatedAt DESC.
 */
@Service
@RequiredArgsConstructor
public class GetMyCVsUseCase {

    private final OnlineCVRepository cvRepository;

    @Transactional(readOnly = true)
    public List<OnlineCV> execute(UUID candidateId) {
        return cvRepository.findAllByCandidateId(candidateId)
                .stream()
                .sorted(Comparator.comparing(OnlineCV::getUpdatedAt).reversed())
                .toList();
    }
}