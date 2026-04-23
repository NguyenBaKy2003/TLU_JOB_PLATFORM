package edu.tlu.jobplatform.cv.infrastructure.render;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.StringTemplateResolver;

/**
 * Cau hinh Thymeleaf engine RIENG cho CV rendering.
 *
 * Chi dung StringTemplateResolver vi moi template deu lay tu DB (htmlContent).
 * Khong con file classpath template.
 *
 * Engine nay doc lap voi Spring Boot default engine (HTML5 mode).
 * Dung XML mode de Flying Saucer render duoc XHTML.
 */
@Configuration
public class CVRenderConfig {

    @Bean("cvTemplateEngine")
    public TemplateEngine cvTemplateEngine() {
        StringTemplateResolver resolver = new StringTemplateResolver();
        resolver.setTemplateMode(TemplateMode.XML); // XHTML strict cho Flying Saucer
        resolver.setCacheable(false); // DB content thay doi thuong xuyen

        TemplateEngine engine = new TemplateEngine();
        engine.setTemplateResolver(resolver);
        return engine;
    }
}