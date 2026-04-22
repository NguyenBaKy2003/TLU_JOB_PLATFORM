package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.cv.domain.service.CVDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Restore CV từ ARCHIVED → DRAFT.
 * Slug cũ bị xóa (sẽ sinh mới khi publish lại).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RestoreCVUseCase {

    private final OnlineCVRepository cvRepository;
    private final CVDomainService cvDomainService;

    @Transactional
    public OnlineCV execute(UUID cvId, UUID candidateId) {
        // validateCanCreateCV không cần kiểm tra ở đây vì CV đã tồn tại,
        // chỉ đổi trạng thái, không tạo mới.
        OnlineCV cv = cvDomainService.loadAndVerifyOwnership(cvId, candidateId);
        cv.restore();
        OnlineCV saved = cvRepository.save(cv);
        log.info("OnlineCV restored: cvId={}", saved.getId());
        return saved;
    }
}