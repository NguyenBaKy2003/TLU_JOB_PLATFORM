package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.model.vo.CVStatus;
import edu.tlu.jobplatform.cv.domain.model.vo.CVVisibility;
import edu.tlu.jobplatform.cv.domain.repository.CVTemplateRepository;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.cv.domain.service.CVDomainService;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.UUID;

/**
 * Tạo CV mới từ template.
 * Flow: validate quota → load template → tạo CV draft → save
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CreateOnlineCVUseCase {

    private final OnlineCVRepository cvRepository;
    private final CVTemplateRepository templateRepository;
    private final CVDomainService cvDomainService;

    public record Command(
            UUID candidateId,
            String title,
            UUID templateId // null = dùng template mặc định
    ) {
    }

    @Transactional
    public OnlineCV execute(Command cmd) {
        // Kiểm tra giới hạn số CV
        cvDomainService.validateCanCreateCV(cmd.candidateId());

        // Load template — nếu không truyền thì lấy template đầu tiên (non-premium)
        CVTemplate template;
        if (cmd.templateId() != null) {
            template = templateRepository.findById(cmd.templateId())
                    .orElseThrow(() -> new BusinessRuleException(
                            "Template không tồn tại.", "TEMPLATE_NOT_FOUND"));
        } else {
            template = templateRepository.findByPremium(false)
                    .stream().findFirst()
                    .orElseThrow(() -> new BusinessRuleException(
                            "Không có template mặc định.", "NO_DEFAULT_TEMPLATE"));
        }

        OnlineCV cv = OnlineCV.builder()
                .id(UUID.randomUUID())
                .candidateId(cmd.candidateId())
                .title(cmd.title() != null ? cmd.title() : "CV của tôi")
                .templateId(template.getId())
                .sections(new ArrayList<>())
                .status(CVStatus.DRAFT)
                .visibility(CVVisibility.PRIVATE)
                .viewCount(0L)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        OnlineCV saved = cvRepository.save(cv);
        log.info("OnlineCV created: cvId={} candidateId={}", saved.getId(), saved.getCandidateId());
        return saved;
    }
}