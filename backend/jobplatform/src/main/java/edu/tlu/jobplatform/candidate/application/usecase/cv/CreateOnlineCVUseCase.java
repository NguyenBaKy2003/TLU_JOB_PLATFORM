package edu.tlu.jobplatform.candidate.application.usecase.cv;

import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateCVRepository;
import edu.tlu.jobplatform.candidate.domain.service.CVDomainService;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * UseCase: Tạo CV online (không upload file — soạn trực tiếp trên hệ thống).
 *
 * Business Rules:
 * BR-01: Tối đa 5 CV (dùng chung với UploadCVUseCase)
 * BR-02: CV đầu tiên tự động là primary
 * BR-03: Title không được để trống
 */
@Service
@RequiredArgsConstructor
public class CreateOnlineCVUseCase {

    private final CandidateCVRepository cvRepository;
    private final CVDomainService cvDomainService;

    public record Command(
            UUID candidateId,
            String title,
            String content // nội dung CV soạn online (HTML hoặc plain text)
    ) {
    }

    @Transactional
    public CandidateCV execute(Command cmd) {
        if (cmd.title() == null || cmd.title().isBlank()) {
            throw new BusinessRuleException(
                    "Tiêu đề CV không được để trống.", "CV_TITLE_BLANK");
        }

        // BR-01: Validate số lượng
        int count = cvRepository.countByCandidateId(cmd.candidateId());
        cvDomainService.validateCanAddCV(count);

        boolean isPrimary = count == 0; // BR-02

        CandidateCV cv = CandidateCV.builder()
                .id(UUID.randomUUID())
                .candidateId(cmd.candidateId())
                .title(cmd.title().trim())
                .type(CandidateCV.CVType.ONLINE)
                .fileUrl(null)
                .parsedContent(cmd.content())
                .primary(isPrimary)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return cvRepository.save(cv);
    }
}