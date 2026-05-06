package edu.tlu.jobplatform.candidate.application.usecase.cv;

import edu.tlu.jobplatform.shared.port.FileStoragePort;
import edu.tlu.jobplatform.candidate.application.port.out.CVParserPort;
import edu.tlu.jobplatform.candidate.domain.model.CandidateCV;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateCVRepository;
import edu.tlu.jobplatform.cv.domain.service.CVDomainService;
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
                        InputStream inputStream,
                        /**
                         * true = đặt CV mới này làm primary ngay sau khi upload.
                         * false = giữ nguyên primary hiện tại.
                         * null = tự động: primary nếu là CV đầu tiên, không primary nếu đã có CV khác.
                         */
                        Boolean setAsPrimary) {

                /** Factory method — hành vi tự động (backward compatible) */
                public static Command auto(UUID candidateId, String title, String fileName,
                                String contentType, long fileSize, InputStream inputStream) {
                        return new Command(candidateId, title, fileName, contentType, fileSize, inputStream, null);
                }
        }

        @Transactional
        public CandidateCV execute(Command cmd) {
                if (!ALLOWED_TYPES.contains(cmd.contentType())) {
                        throw new BusinessRuleException("Chỉ chấp nhận PDF, DOC, DOCX.", "INVALID_FILE_TYPE");
                }

                List<CandidateCV> existing = cvRepository.findAllByCandidateId(cmd.candidateId());
                cvDomainService.validateCanAddCV(existing.size());

                // Đọc bytes một lần
                byte[] fileBytes;
                try {
                        fileBytes = cmd.inputStream().readAllBytes();
                } catch (Exception e) {
                        throw new BusinessRuleException("Không thể đọc file. Vui lòng thử lại.", "FILE_READ_ERROR");
                }

                // Upload lên S3
                String fileUrl = fileStorage.upload(
                                new java.io.ByteArrayInputStream(fileBytes),
                                cmd.fileName(), cmd.contentType(), CV_FOLDER);

                // Parse nội dung — best-effort
                String parsedContent = "";
                try {
                        parsedContent = cvParser.parse(
                                        new java.io.ByteArrayInputStream(fileBytes), cmd.contentType());
                } catch (Exception e) {
                        log.warn("CV parse failed for candidateId={}: {}", cmd.candidateId(), e.getMessage());
                }

                // ── Quyết định primary ─
                // Logic:
                // setAsPrimary = null → tự động: primary nếu chưa có CV nào
                // setAsPrimary = true → user chủ động muốn set primary
                // setAsPrimary = false → giữ nguyên primary hiện tại
                boolean isFirstCV = existing.isEmpty();
                boolean makePrimary = cmd.setAsPrimary() != null
                                ? cmd.setAsPrimary()
                                : isFirstCV;

                // Nếu cần set primary → unset primary của CV cũ
                if (makePrimary && !isFirstCV) {
                        List<CandidateCV> updated = existing.stream()
                                        .map(cv -> {
                                                if (!cv.isPrimary())
                                                        return cv;
                                                return CandidateCV.builder()
                                                                .id(cv.getId())
                                                                .candidateId(cv.getCandidateId())
                                                                .title(cv.getTitle())
                                                                .type(cv.getType())
                                                                .fileUrl(cv.getFileUrl())
                                                                .parsedContent(cv.getParsedContent())
                                                                .primary(false) // ← unset primary
                                                                .createdAt(cv.getCreatedAt())
                                                                .updatedAt(LocalDateTime.now())
                                                                .build();
                                        })
                                        .toList();
                        cvRepository.saveAll(updated);
                }

                CandidateCV cv = CandidateCV.builder()
                                .id(UUID.randomUUID())
                                .candidateId(cmd.candidateId())
                                .title(cmd.title())
                                .type(CandidateCV.CVType.UPLOADED)
                                .fileUrl(fileUrl)
                                .parsedContent(parsedContent)
                                .primary(makePrimary)
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();

                CandidateCV saved = cvRepository.save(cv);

                if (!parsedContent.isBlank()) {
                        eventPublisher.publishEvent(new CVUploadedEvent(
                                        saved.getCandidateId(), saved.getId(), parsedContent, makePrimary));
                }

                log.info("CV uploaded: cvId={} candidateId={} primary={}",
                                saved.getId(), saved.getCandidateId(), makePrimary);

                return saved;
        }
}