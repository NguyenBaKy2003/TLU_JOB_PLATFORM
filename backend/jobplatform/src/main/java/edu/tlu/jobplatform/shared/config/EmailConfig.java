package edu.tlu.jobplatform.shared.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import org.thymeleaf.templateresolver.ITemplateResolver;

import java.util.Properties;

/**
 * Cấu hình JavaMailSender + Thymeleaf TemplateEngine riêng cho email HTML.
 *
 * Tại sao dùng TemplateEngine riêng (không dùng chung với Spring MVC)?
 * - Spring MVC Thymeleaf dùng SpringResourceTemplateResolver
 * (classpath:templates/)
 * - Email cần ClassLoaderTemplateResolver (classpath:templates/email/)
 * - Tách ra để tránh conflict, cache policy khác nhau (prod: email cached)
 *
 * application.yml cần thêm:
 * 
 * <pre>
 * spring:
 *   mail:
 *     host: smtp.gmail.com
 *     port: 587
 *     username: your@gmail.com
 *     password: app-password   # Gmail App Password (không phải mật khẩu thường)
 *     properties:
 *       mail.smtp.auth: true
 *       mail.smtp.starttls.enable: true
 *
 * app:
 *   mail:
 *     from: "JobPlatform <noreply@jobplatform.vn>"
 * </pre>
 */
@Configuration
public class EmailConfig {

    @Value("${spring.mail.host}")
    private String host;

    @Value("${spring.mail.port}")
    private int port;

    @Value("${spring.mail.username}")
    private String username;

    @Value("${spring.mail.password}")
    private String password;

    // ── JavaMailSender ─

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(password);
        mailSender.setDefaultEncoding("UTF-8");

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.debug", "false");

        return mailSender;
    }

    // ── Thymeleaf Template Engine riêng cho email ──────────────────

    /**
     * Bean tên "emailTemplateEngine" — @Qualifier dùng để inject đúng bean này
     * thay vì Spring MVC TemplateEngine mặc định.
     */
    @Bean(name = "emailTemplateEngine")
    public TemplateEngine emailTemplateEngine() {
        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.addTemplateResolver(emailTemplateResolver());
        return engine;
    }

    private ITemplateResolver emailTemplateResolver() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/email/"); // src/main/resources/templates/email/
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(false); // TODO: đổi true khi production
        resolver.setOrder(1);
        return resolver;
    }
}
