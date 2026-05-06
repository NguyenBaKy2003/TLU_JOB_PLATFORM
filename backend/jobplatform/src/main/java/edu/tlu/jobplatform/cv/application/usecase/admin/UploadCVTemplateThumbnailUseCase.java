package edu.tlu.jobplatform.cv.application.usecase.admin;

import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.repository.CVTemplateRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.port.FileStoragePort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * Upload / thay ảnh thumbnail cho một CVTemplate.
 *
 * <p>
 * Quy tắc:
 * <ul>
 * <li>Chỉ chấp nhận JPEG, PNG, WEBP.</li>
 * <li>Kích thước tối đa {@value #MAX_SIZE_MB} MB.</li>
 * <li>Ảnh được lưu vào thư mục {@value #THUMBNAIL_FOLDER} trên storage.</li>
 * <li>URL mới được cập nhật ngay vào domain model và persist.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class UploadCVTemplateThumbnailUseCase {

    private static final String THUMBNAIL_FOLDER = "cv-template-thumbnails";
    private static final long MAX_SIZE_MB = 5;
    private static final long MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;
    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp");

    private final CVTemplateRepository templateRepository;
    private final FileStoragePort fileStorage;

    /**
     * @param templateId ID của template cần cập nhật thumbnail.
     * @param file       File ảnh được upload từ multipart request.
     * @return CVTemplate sau khi đã cập nhật thumbnailUrl.
     */
    @Transactional
    public CVTemplate execute(UUID templateId, MultipartFile file) {

        // ── 1. Validate file ──────────────────────────────────────────────
        if (file == null || file.isEmpty())
            throw new BusinessRuleException("File không được để trống.", "FILE_EMPTY");

        if (file.getSize() > MAX_SIZE)
            throw new BusinessRuleException(
                    "Ảnh tối đa " + MAX_SIZE_MB + "MB.", "FILE_TOO_LARGE");

        if (!ALLOWED_TYPES.contains(file.getContentType()))
            throw new BusinessRuleException(
                    "Chỉ chấp nhận JPEG, PNG, WEBP.", "INVALID_FILE_TYPE");

        // ── 2. Load aggregate ─────────────────────────────────────────────
        CVTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Template không tồn tại.", "TEMPLATE_NOT_FOUND"));

        // ── 3. Upload lên storage ─────────────────────────────────────────
        try {
            String url = fileStorage.upload(
                    file.getInputStream(),
                    file.getOriginalFilename(),
                    file.getContentType(),
                    THUMBNAIL_FOLDER);

            // ── 4. Cập nhật domain model ──────────────────────────────────
            template.updateThumbnail(url);

        } catch (IOException e) {
            throw new BusinessRuleException("Không thể đọc file.", "FILE_READ_ERROR");
        }

        // ── 5. Persist & trả về ───────────────────────────────────────────
        return templateRepository.save(template);
    }
}