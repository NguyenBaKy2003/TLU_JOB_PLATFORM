package edu.tlu.jobplatform.candidate.application.usecase.cv;

import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateCVRepository;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SetPrimaryCVUseCase {

    private final CandidateCVRepository cvRepository;
    private final OnlineCVRepository onlineCVRepository;

    public enum CVKind {
        UPLOADED, ONLINE
    }

    @Transactional
    public void execute(UUID candidateId, UUID cvId) {

        // ── Load toàn bộ CVs của candidate ──
        List<CandidateCV> allUploaded = cvRepository.findAllByCandidateId(candidateId);
        List<OnlineCV> allOnline = onlineCVRepository.findAllByCandidateId(candidateId);

        // ── Detect kind ──
        CVKind kind = detect(cvId, allUploaded, allOnline);

        // ── Unmark tất cả ──
        allUploaded.forEach(CandidateCV::unmarkPrimary);
        allOnline.forEach(OnlineCV::unmarkPrimary);

        // ── Mark target ──
        if (kind == CVKind.UPLOADED) {
            allUploaded.stream()
                    .filter(cv -> cv.getId().equals(cvId))
                    .findFirst()
                    .orElseThrow(() -> notFound(cvId))
                    .markAsPrimary();
        } else {
            OnlineCV target = allOnline.stream()
                    .filter(cv -> cv.getId().equals(cvId))
                    .findFirst()
                    .orElseThrow(() -> notFound(cvId));

            if (!target.isOwnedBy(candidateId))
                throw new BusinessRuleException(
                        "Bạn không có quyền thao tác với CV này.", "FORBIDDEN");

            target.markAsPrimary();
        }

        cvRepository.saveAll(allUploaded);
        onlineCVRepository.saveAll(allOnline);
    }

    @Transactional
    public void execute(UUID candidateId, UUID cvId, CVKind kind) {
        execute(candidateId, cvId);
    }

    /**
     * Xác định CV thuộc loại nào dựa trên danh sách đã load sẵn.
     * Ưu tiên UPLOADED trước (tránh UUID collision dù rất hiếm).
     */
    private CVKind detect(UUID cvId,
            List<CandidateCV> uploaded,
            List<OnlineCV> online) {
        boolean inUploaded = uploaded.stream().anyMatch(cv -> cv.getId().equals(cvId));
        if (inUploaded)
            return CVKind.UPLOADED;

        boolean inOnline = online.stream().anyMatch(cv -> cv.getId().equals(cvId));
        if (inOnline)
            return CVKind.ONLINE;

        throw notFound(cvId);
    }

    private ResourceNotFoundException notFound(UUID cvId) {
        return new ResourceNotFoundException(
                "CV không tồn tại hoặc không thuộc về bạn: " + cvId);
    }
}