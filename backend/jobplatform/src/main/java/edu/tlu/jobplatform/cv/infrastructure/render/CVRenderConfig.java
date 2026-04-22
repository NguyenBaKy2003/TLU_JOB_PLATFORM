package edu.tlu.jobplatform.cv.infrastructure.render;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

/**
 * Cấu hình Thymeleaf engine RIÊNG cho CV rendering.
 *
 * Tại sao cần engine riêng?
 * - Engine mặc định của Spring Boot dùng HTML5 mode (lenient parsing).
 * - Flying Saucer yêu cầu XHTML hợp lệ (strict XML).
 * - Template resolver riêng trỏ đến /templates/cv/ thay vì /templates/.
 *
 * Bean name "cvTemplateEngine" để phân biệt với Spring Boot's default engine.
 */
@Configuration
public class CVRenderConfig {

    @Bean("cvTemplateEngine")
    public TemplateEngine cvTemplateEngine() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();

        resolver.setPrefix("templates/cv/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.XML); // XHTML strict cho Flying Saucer
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(true);
        resolver.setCacheTTLMs(3_600_000L); // 1 giờ

        TemplateEngine engine = new TemplateEngine();
        engine.setTemplateResolver(resolver);
        return engine;
    }
}