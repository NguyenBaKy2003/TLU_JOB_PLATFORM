package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.service.CVDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Lấy chi tiết CV để chỉnh sửa — yêu cầu ownership.
 * Trả về đầy đủ sections (cả visible = false).
 */
@Service
@RequiredArgsConstructor
public class GetCVDetailUseCase {

    private final CVDomainService cvDomainService;

    @Transactional(readOnly = true)
    public OnlineCV execute(UUID cvId, UUID candidateId) {
        return cvDomainService.loadAndVerifyOwnership(cvId, candidateId);
    }
}