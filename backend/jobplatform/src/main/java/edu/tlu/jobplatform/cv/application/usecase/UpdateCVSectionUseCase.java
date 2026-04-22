package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.domain.model.CVSection;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.model.vo.SectionType;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.cv.domain.service.CVDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Thêm mới hoặc cập nhật một section trong CV.
 *
 * - sectionId = null → thêm mới
 * - sectionId != null → cập nhật section đã có
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateCVSectionUseCase {

    private final OnlineCVRepository cvRepository;
    private final CVDomainService cvDomainService;

    public record Command(
            UUID cvId,
            UUID candidateId,
            UUID sectionId, // null = add new
            SectionType type, // bắt buộc khi add new
            String title,
            String content, // JSON string
            boolean visible) {
    }

    @Transactional
    public CVSection execute(Command cmd) {
        OnlineCV cv = cvDomainService.loadAndVerifyOwnership(cmd.cvId(), cmd.candidateId());

        CVSection result;
        if (cmd.sectionId() == null) {
            // Thêm mới
            result = cv.addSection(cmd.type(), cmd.title(), cmd.content());
        } else {
            // Cập nhật
            cv.updateSection(cmd.sectionId(), cmd.title(), cmd.content(), cmd.visible());
            result = cv.getSections().stream()
                    .filter(s -> s.getId().equals(cmd.sectionId()))
                    .findFirst()
                    .orElseThrow();
        }

        cvRepository.save(cv);
        log.info("CVSection updated: cvId={} sectionId={}", cmd.cvId(), result.getId());
        return result;
    }
}