package edu.tlu.jobplatform.cv.infrastructure.render;

import com.lowagie.text.DocumentException;
import edu.tlu.jobplatform.cv.application.port.out.CVRenderPort;
import edu.tlu.jobplatform.cv.domain.model.CVSection;
import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Implements CVRenderPort.
 *
 * Pipeline:
 * 1. Build Thymeleaf Context tu OnlineCV domain object
 * 2. cvTemplateEngine.process(template.getHtmlContent(), ctx)
 * StringTemplateResolver render truc tiep HTML string tu DB
 * 3. Flying Saucer ITextRenderer: XHTML -> PDF bytes
 *
 * Khong con file classpath template. Moi template lay tu DB qua Admin API.
 */
@Slf4j
@Component
public class ThymeleafCVRenderAdapter implements CVRenderPort {

    private final TemplateEngine cvTemplateEngine;

    public ThymeleafCVRenderAdapter(
            @Qualifier("cvTemplateEngine") TemplateEngine cvTemplateEngine) {
        this.cvTemplateEngine = cvTemplateEngine;
    }

    @Override
    public byte[] render(OnlineCV cv, CVTemplate template) {
        if (template.getHtmlContent() == null || template.getHtmlContent().isBlank()) {
            throw new BusinessRuleException(
                    "Template chua co noi dung HTML. Vui long cap nhat template qua Admin API.",
                    "TEMPLATE_CONTENT_EMPTY");
        }

        try {
            Context ctx = buildContext(cv);

            // StringTemplateResolver nhan thang HTML string tu DB
            String html = cvTemplateEngine.process(template.getHtmlContent(), ctx);

            return htmlToPdf(html);

        } catch (DocumentException | IOException e) {
            log.error("CV render failed: cvId={} templateId={} error={}",
                    cv.getId(), template.getId(), e.getMessage(), e);
            throw new BusinessRuleException(
                    "Khong the tao file PDF. Vui long thu lai.", "CV_RENDER_FAILED");
        }
    }

    // Context builder

    private Context buildContext(OnlineCV cv) {
        Context ctx = new Context();

        ctx.setVariable("cv", cv);
        ctx.setVariable("personalInfo", cv.getPersonalInfo());

        // Group visible sections theo type -- ${sectionsByType['EXPERIENCE']}
        Map<String, List<CVSection>> sectionsByType = new LinkedHashMap<>();
        for (CVSection s : cv.getVisibleSections()) {
            sectionsByType
                    .computeIfAbsent(s.getType().name(), k -> new ArrayList<>())
                    .add(s);
        }
        ctx.setVariable("sectionsByType", sectionsByType);

        // Danh sach phang theo displayOrder -- th:each="section : ${sections}"
        ctx.setVariable("sections", cv.getVisibleSections());

        return ctx;
    }

    // Flying Saucer

    private byte[] htmlToPdf(String html) throws DocumentException, IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            renderer.createPDF(out);
            return out.toByteArray();
        }
    }
}