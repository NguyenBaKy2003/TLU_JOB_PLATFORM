package edu.tlu.jobplatform.company.application.usecase;

import edu.tlu.jobplatform.company.domain.model.CompanyGalleryImage;
import edu.tlu.jobplatform.company.domain.repository.CompanyGalleryRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.port.FileStoragePort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UploadGalleryImageUseCase {

    private static final int MAX_GALLERY_IMAGES = 10;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    private final CompanyGalleryRepository galleryRepository;
    private final FileStoragePort fileStorage;

    @Transactional
    public List<CompanyGalleryImage> execute(UUID companyId,
            List<MultipartFile> files,
            List<String> captions) {
        int current = galleryRepository.countByCompanyId(companyId);

        if (current + files.size() > MAX_GALLERY_IMAGES)
            throw new BusinessRuleException(
                    "Vượt quá giới hạn " + MAX_GALLERY_IMAGES + " ảnh. "
                            + "Hiện có " + current + " ảnh, còn có thể thêm "
                            + (MAX_GALLERY_IMAGES - current) + " ảnh.",
                    "GALLERY_LIMIT_EXCEEDED");

        for (MultipartFile file : files) {
            if (file.getSize() > MAX_FILE_SIZE)
                throw new BusinessRuleException(
                        "File \"" + file.getOriginalFilename() + "\" vượt quá 5MB.",
                        "FILE_TOO_LARGE");

            String mime = file.getContentType();
            if (mime == null || !mime.startsWith("image/"))
                throw new BusinessRuleException(
                        "File \"" + file.getOriginalFilename() + "\" không phải ảnh.",
                        "INVALID_FILE_TYPE");
        }

        List<CompanyGalleryImage> results = new ArrayList<>();

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            String caption = (captions != null && i < captions.size()) ? captions.get(i) : null;

            String imageUrl;
            try {
                imageUrl = fileStorage.upload(
                        file.getInputStream(),
                        file.getOriginalFilename(),
                        file.getContentType(),
                        "companies/" + companyId + "/gallery");
            } catch (IOException e) {
                throw new BusinessRuleException(
                        "Không thể đọc file \"" + file.getOriginalFilename() + "\".",
                        "FILE_READ_ERROR");
            }

            CompanyGalleryImage image = CompanyGalleryImage.builder()
                    .id(UUID.randomUUID())
                    .companyId(companyId)
                    .imageUrl(imageUrl)
                    .caption(caption)
                    .displayOrder(current + i)
                    .build();

            results.add(galleryRepository.save(image));
        }

        log.info("Gallery uploaded: company={} count={}", companyId, results.size());
        return results;
    }
}