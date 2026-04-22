package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.application.port.out.CVStoragePort;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.cv.domain.service.CVDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Xóa hoàn toàn CV (hard delete).
 * Nếu có file PDF đã export trên S3 → xóa luôn.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DeleteOnlineCVUseCase {

    private final OnlineCVRepository cvRepository;
    private final CVDomainService cvDomainService;
    private final CVStoragePort cvStoragePort;

    @Transactional
    public void execute(UUID cvId, UUID candidateId) {
        OnlineCV cv = cvDomainService.loadAndVerifyOwnership(cvId, candidateId);

        // Xóa PDF trên S3 nếu có (best-effort, không throw nếu lỗi)
        if (cv.getExportedPdfUrl() != null) {
            try {
                cvStoragePort.delete(cv.getExportedPdfUrl());
            } catch (Exception e) {
                log.warn("Failed to delete PDF from storage: cvId={} url={} error={}",
                        cvId, cv.getExportedPdfUrl(), e.getMessage());
            }
        }

        cvRepository.deleteById(cvId);
        log.info("OnlineCV deleted: cvId={} candidateId={}", cvId, candidateId);
    }
}