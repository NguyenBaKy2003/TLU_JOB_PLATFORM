package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.domain.model.CVSection;
import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.CVTemplateRepository;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.StringTemplateResolver;

import java.util.Comparator;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PreviewCVUseCase {

    private final OnlineCVRepository cvRepository;
    private final CVTemplateRepository templateRepository;

    public String execute(UUID cvId, UUID candidateId) {
        OnlineCV cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new BusinessRuleException("CV không tồn tại.", "CV_NOT_FOUND"));

        if (!cv.getCandidateId().equals(candidateId))
            throw new BusinessRuleException("Không có quyền.", "CV_ACCESS_DENIED");

        CVTemplate template = templateRepository.findById(cv.getTemplateId())
                .orElseThrow(() -> new BusinessRuleException("Template không tồn tại.", "TEMPLATE_NOT_FOUND"));

        Context ctx = new Context();
        ctx.setVariable("cv", cv);
        ctx.setVariable("personalInfo", cv.getPersonalInfo());
        ctx.setVariable("sections", cv.getSections().stream()
                .filter(CVSection::isVisible)
                .sorted(Comparator.comparingInt(CVSection::getDisplayOrder))
                .toList());
        ctx.setVariable("editable", true);

        return renderFromString(template.getHtmlContent(), ctx);
    }

    /**
     * Render Thymeleaf từ HTML string (không phải file).
     * Dùng StringTemplateResolver — engine độc lập, không dùng Spring bean.
     */
    private String renderFromString(String htmlContent, Context ctx) {
        // Tạo engine riêng với StringTemplateResolver

        StringTemplateResolver resolver = new StringTemplateResolver();
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCacheable(false); // template từ DB, không cache

        TemplateEngine engine = new TemplateEngine();
        engine.setTemplateResolver(resolver);

        return engine.process(htmlContent, ctx);
    }
}