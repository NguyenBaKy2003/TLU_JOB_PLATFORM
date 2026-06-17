package edu.tlu.jobplatform.candidate.application.usecase.cv;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.port.FileStoragePort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateCVRepository;
import edu.tlu.jobplatform.cv.domain.service.CVDomainService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeleteCVUseCase {

    private final CandidateCVRepository cvRepository;
    private final CVDomainService cvDomainService;
    private final FileStoragePort fileStorage;

    @Transactional
    public void execute(UUID candidateId, UUID cvId) {
        CandidateCV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new BusinessRuleException(
                        "CV không tồn tại.", "CV_NOT_FOUND"));

        if (!cv.getCandidateId().equals(candidateId)) {
            throw new BusinessRuleException(
                    "Bạn không có quyền xóa CV này.", "CV_NOT_OWNED");
        }

        boolean wasPrimary = cv.isPrimary();

        if (cv.isUploaded() && cv.getFileUrl() != null) {
            fileStorage.delete(cv.getFileUrl());
        }

        cvRepository.deleteById(cvId);

        if (wasPrimary) {
            List<CandidateCV> remaining = cvRepository.findAllByCandidateId(candidateId);
            List<CandidateCV> updated = cvDomainService.handlePrimaryDeleted(remaining);
            if (!updated.isEmpty())
                cvRepository.saveAll(updated);
        }
    }
}