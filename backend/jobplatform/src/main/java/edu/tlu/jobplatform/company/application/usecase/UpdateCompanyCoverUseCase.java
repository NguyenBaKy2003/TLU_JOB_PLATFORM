package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.port.FileStoragePort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UpdateCompanyCoverUseCase {

    private static final String COVER_FOLDER = "company-covers";
    private static final long MAX_SIZE = 10L * 1024 * 1024; // 10MB — cover to hơn logo
    private static final List<String> ALLOWED = List.of(
            "image/jpeg", "image/png", "image/webp");

    private final CompanyRepository companyRepository;
    private final FileStoragePort fileStorage;

    @Transactional
    public CompanyProfile execute(UUID ownerId, MultipartFile file) {
        validateFile(file);

        CompanyProfile company = companyRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Bạn chưa có hồ sơ công ty.", "COMPANY_NOT_FOUND"));

        try {
            String url = fileStorage.upload(
                    file.getInputStream(),
                    file.getOriginalFilename(),
                    file.getContentType(),
                    COVER_FOLDER);

            company.updateMedia(null, url); // null = giữ nguyên logoUrl
        } catch (IOException e) {
            throw new BusinessRuleException("Không thể đọc file.", "FILE_READ_ERROR");
        }

        return companyRepository.save(company);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty())
            throw new BusinessRuleException("File không được để trống.", "FILE_EMPTY");
        if (file.getSize() > MAX_SIZE)
            throw new BusinessRuleException("Ảnh cover tối đa 10MB.", "FILE_TOO_LARGE");
        if (!ALLOWED.contains(file.getContentType()))
            throw new BusinessRuleException(
                    "Chỉ chấp nhận JPEG, PNG, WEBP.", "INVALID_FILE_TYPE");
    }
}