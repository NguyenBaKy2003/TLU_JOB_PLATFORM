package edu.tlu.jobplatform.cv.application.service;

import edu.tlu.jobplatform.cv.domain.model.CVSection;
import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.repository.CVTemplateRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.StringTemplateResolver;

import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class CVRenderService {

    private final CVTemplateRepository templateRepository;

    public String render(OnlineCV cv) {
        CVTemplate template = templateRepository.findById(cv.getTemplateId())
                .orElseThrow(() -> new BusinessRuleException(
                        "Template không tồn tại.", "TEMPLATE_NOT_FOUND"));

        Context ctx = new Context();
        ctx.setVariable("cv", cv);
        ctx.setVariable("personalInfo", cv.getPersonalInfo());
        ctx.setVariable("sections", cv.getSections().stream()
                .filter(CVSection::isVisible)
                .sorted(Comparator.comparingInt(CVSection::getDisplayOrder))
                .toList());
        ctx.setVariable("editable", false);

        return renderFromString(template.getHtmlContent(), ctx);
    }

    private String renderFromString(String htmlContent, Context ctx) {
        StringTemplateResolver resolver = new StringTemplateResolver();
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCacheable(false);

        TemplateEngine engine = new TemplateEngine();
        engine.setTemplateResolver(resolver);

        return engine.process(htmlContent, ctx);
    }
}