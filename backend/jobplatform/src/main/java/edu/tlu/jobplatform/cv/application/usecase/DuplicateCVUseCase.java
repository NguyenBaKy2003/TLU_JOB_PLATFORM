package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.domain.model.CVSection;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.model.vo.CVStatus;
import edu.tlu.jobplatform.cv.domain.model.vo.CVVisibility;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.cv.domain.service.CVDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Clone một CV hiện có → tạo bản sao DRAFT mới.
 * Dùng khi user muốn tạo nhiều biến thể CV cho từng loại công việc.
 *
 * Sections và personalInfo được deep-copy.
 * Slug, viewCount, exportedPdfUrl KHÔNG được copy.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DuplicateCVUseCase {

    private final OnlineCVRepository cvRepository;
    private final CVDomainService cvDomainService;

    @Transactional
    public OnlineCV execute(UUID cvId, UUID candidateId) {
        // Kiểm tra quota trước khi tạo bản copy
        cvDomainService.validateCanCreateCV(candidateId);

        OnlineCV source = cvDomainService.loadAndVerifyOwnership(cvId, candidateId);

        // Deep-copy sections với ID mới
        List<CVSection> copiedSections = new ArrayList<>();
        for (CVSection s : source.getSections()) {
            copiedSections.add(CVSection.builder()
                    .id(UUID.randomUUID())
                    .cvId(null) // sẽ được gán sau khi CV mới có ID
                    .type(s.getType())
                    .title(s.getTitle())
                    .content(s.getContent())
                    .displayOrder(s.getDisplayOrder())
                    .visible(s.isVisible())
                    .build());
        }

        OnlineCV copy = OnlineCV.builder()
                .id(UUID.randomUUID())
                .candidateId(candidateId)
                .title("Bản sao - " + source.getTitle())
                .templateId(source.getTemplateId())
                .personalInfo(source.getPersonalInfo()) // PersonalInfo là immutable VO → safe
                .sections(copiedSections)
                .status(CVStatus.DRAFT)
                .visibility(CVVisibility.PRIVATE)
                .viewCount(0L)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        OnlineCV saved = cvRepository.save(copy);
        log.info("OnlineCV duplicated: sourceId={} newId={}", cvId, saved.getId());
        return saved;
    }
}