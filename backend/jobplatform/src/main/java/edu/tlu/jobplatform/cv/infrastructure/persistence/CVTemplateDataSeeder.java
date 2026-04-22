package edu.tlu.jobplatform.cv.infrastructure.persistence;

import edu.tlu.jobplatform.cv.infrastructure.persistence.entity.CVTemplateJpaEntity;
import edu.tlu.jobplatform.cv.infrastructure.persistence.repository.CVTemplateJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Seed dữ liệu mặc định cho bảng cv_templates khi khởi động.
 * Chỉ chạy nếu bảng ĐANG TRỐNG — idempotent, an toàn khi restart.
 *
 * thymeleafTemplate phải khớp với tên file trong:
 * src/main/resources/templates/cv/{thymeleafTemplate}.html
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CVTemplateDataSeeder implements ApplicationRunner {

    private final CVTemplateJpaRepository templateRepo;

    @Override
    public void run(ApplicationArguments args) {
        if (templateRepo.count() > 0) {
            log.debug("cv_templates already seeded, skipping.");
            return;
        }

        List<CVTemplateJpaEntity> defaults = List.of(
                buildTemplate(
                        "Classic",
                        "https://cdn.jobplatform.vn/assets/cv-templates/classic-thumb.png",
                        "professional",
                        false,
                        "cv-template-classic" // → templates/cv/cv-template-classic.html
                ),
                buildTemplate(
                        "Modern",
                        "https://cdn.jobplatform.vn/assets/cv-templates/modern-thumb.png",
                        "professional",
                        false,
                        "cv-template-modern" // → templates/cv/cv-template-modern.html
                ),
                buildTemplate(
                        "Minimal",
                        "https://cdn.jobplatform.vn/assets/cv-templates/minimal-thumb.png",
                        "simple",
                        false,
                        "cv-template-classic" // dùng lại classic cho đến khi có template riêng
                ),
                buildTemplate(
                        "Creative Pro",
                        "https://cdn.jobplatform.vn/assets/cv-templates/creative-thumb.png",
                        "creative",
                        true, // premium
                        "cv-template-modern"));

        templateRepo.saveAll(defaults);
        log.info("Seeded {} default CV templates.", defaults.size());
    }

    private CVTemplateJpaEntity buildTemplate(
            String name, String thumbnailUrl,
            String category, boolean premium,
            String thymeleafTemplate) {

        CVTemplateJpaEntity e = new CVTemplateJpaEntity();
        e.setId(UUID.randomUUID());
        e.setName(name);
        e.setThumbnailUrl(thumbnailUrl);
        e.setCategory(category);
        e.setPremium(premium);
        e.setThymeleafTemplate(thymeleafTemplate);
        return e;
    }
}