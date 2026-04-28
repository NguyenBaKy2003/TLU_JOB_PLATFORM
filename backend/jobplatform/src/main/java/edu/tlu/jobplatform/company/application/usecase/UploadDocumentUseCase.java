package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyDocument;
import edu.tlu.jobplatform.company.domain.model.CompanyDocumentType;
import edu.tlu.jobplatform.company.domain.repository.CompanyDocumentRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.port.FileStoragePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadDocumentUseCase {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final Set<String> ALLOWED_MIME = Set.of(
            "application/pdf", "image/jpeg", "image/png");

    private final CompanyDocumentRepository documentRepository;
    private final FileStoragePort fileStorage;

    @Transactional
    public CompanyDocument execute(UUID companyId, CompanyDocumentType type, MultipartFile file) {

        // ── Validate ──────────────────────────────────────────────────────────
        if (file.isEmpty())
            throw new BusinessRuleException("File không được để trống.", "EMPTY_FILE");

        if (file.getSize() > MAX_FILE_SIZE)
            throw new BusinessRuleException("File vượt quá 10MB.", "FILE_TOO_LARGE");

        String mime = file.getContentType();
        if (!ALLOWED_MIME.contains(mime))
            throw new BusinessRuleException(
                    "Chỉ chấp nhận PDF, JPG, PNG.", "INVALID_FILE_TYPE");

        // ── Upload ────────────────────────────────────────────────────────────
        String fileUrl;
        try {
            fileUrl = fileStorage.upload(
                    file.getInputStream(),
                    file.getOriginalFilename(),
                    mime,
                    "companies/" + companyId + "/documents");
        } catch (IOException e) {
            throw new BusinessRuleException("Không thể đọc file.", "FILE_READ_ERROR");
        }

        // ── Upsert — mỗi type chỉ lưu 1 file, nộp lại thì ghi đè ────────────
        CompanyDocument doc = documentRepository
                .findByCompanyIdAndType(companyId, type)
                .map(existing -> {
                    existing.resubmit(fileUrl, file.getOriginalFilename(), mime, file.getSize());
                    return existing;
                })
                .orElseGet(() -> CompanyDocument.builder()
                        .id(UUID.randomUUID())
                        .companyId(companyId)
                        .type(type)
                        .fileName(file.getOriginalFilename())
                        .fileUrl(fileUrl)
                        .mimeType(mime)
                        .fileSizeBytes(file.getSize())
                        .uploadedAt(LocalDateTime.now())
                        .build());

        CompanyDocument saved = documentRepository.save(doc);
        log.info("Document upserted: company={} type={} file={}", companyId, type, fileUrl);
        return saved;
    }
}