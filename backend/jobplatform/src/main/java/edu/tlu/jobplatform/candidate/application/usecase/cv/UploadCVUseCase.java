package edu.tlu.jobplatform.candidate.application.usecase.cv;

import edu.tlu.jobplatform.candidate.application.port.out.CVParserPort;
import edu.tlu.jobplatform.candidate.application.port.out.FileStoragePort;
import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateCVRepository;
import edu.tlu.jobplatform.candidate.domain.service.CVDomainService;
import edu.tlu.jobplatform.shared.event.candidate.CVUploadedEvent;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadCVUseCase {

    private static final String CV_FOLDER = "cv";
    private static final List<String> ALLOWED_TYPES = List.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    private final CandidateCVRepository cvRepository;
    private final CVDomainService cvDomainService;
    private final FileStoragePort fileStorage;
    private final CVParserPort cvParser;
    private final ApplicationEventPublisher eventPublisher;

    public record Command(
            UUID candidateId,
            String title,
            String fileName,
            String contentType,
            long fileSize,
            InputStream inputStream) {
    }

    @Transactional
    public CandidateCV execute(Command cmd) {
        // Validate file type
        if (!ALLOWED_TYPES.contains(cmd.contentType())) {
            throw new BusinessRuleException(
                    "Chỉ chấp nhận PDF, DOC, DOCX.", "INVALID_FILE_TYPE");
        }

        // BR-01: Validate số lượng CV
        int count = cvRepository.countByCandidateId(cmd.candidateId());
        cvDomainService.validateCanAddCV(count);

        // Đọc bytes một lần — dùng cho cả upload lẫn parse
        byte[] fileBytes;
        try {
            fileBytes = cmd.inputStream().readAllBytes();
        } catch (Exception e) {
            throw new BusinessRuleException(
                    "Không thể đọc file. Vui lòng thử lại.", "FILE_READ_ERROR");
        }

        // Upload lên S3
        String fileUrl = fileStorage.upload(
                new java.io.ByteArrayInputStream(fileBytes),
                cmd.fileName(), cmd.contentType(), CV_FOLDER);

        // Parse nội dung — best-effort, không throw nếu lỗi
        String parsedContent = "";
        try {
            parsedContent = cvParser.parse(
                    new java.io.ByteArrayInputStream(fileBytes),
                    cmd.contentType());
        } catch (Exception e) {
            log.warn("CV parse failed for candidateId={}: {}",
                    cmd.candidateId(), e.getMessage());
        }

        boolean isPrimary = count == 0; // CV đầu tiên tự động là primary

        CandidateCV cv = CandidateCV.builder()
                .id(UUID.randomUUID())
                .candidateId(cmd.candidateId())
                .title(cmd.title())
                .type(CandidateCV.CVType.UPLOADED)
                .fileUrl(fileUrl)
                .parsedContent(parsedContent)
                .primary(isPrimary)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        CandidateCV saved = cvRepository.save(cv);

        // Publish event để AI domain tạo embedding (chạy async)
        if (!parsedContent.isBlank()) {
            eventPublisher.publishEvent(new CVUploadedEvent(
                    saved.getCandidateId(),
                    saved.getId(),
                    parsedContent,
                    isPrimary));
        }

        log.info("CV uploaded: cvId={} candidateId={} primary={}",
                saved.getId(), saved.getCandidateId(), isPrimary);

        return saved;
    }
}