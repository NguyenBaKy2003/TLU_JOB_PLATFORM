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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Implements CVRenderPort.
 *
 * Pipeline:
 * 1. Build Thymeleaf Context từ OnlineCV domain object
 * 2. process(templateName) → resolver ghép "templates/cv/{templateName}.html"
 * 3. Flying Saucer ITextRenderer: XHTML → PDF bytes
 *
 * Không dùng @RequiredArgsConstructor vì cần @Qualifier trên constructor param.
 * Lombok không forward @Qualifier vào generated constructor.
 */
@Slf4j
@Component
public class ThymeleafCVRenderAdapter implements CVRenderPort {

    private final TemplateEngine cvTemplateEngine;

    // Constructor tường minh để @Qualifier hoạt động đúng
    public ThymeleafCVRenderAdapter(@Qualifier("cvTemplateEngine") TemplateEngine cvTemplateEngine) {
        this.cvTemplateEngine = cvTemplateEngine;
    }

    @Override
    public byte[] render(OnlineCV cv, CVTemplate template) {
        try {
            Context ctx = buildContext(cv);

            // FIX: truyền thẳng tên file, KHÔNG prefix "cv/" ở đây.
            // ✅ templates/cv/cv-template-modern.html
            String html = cvTemplateEngine.process(template.getThymeleafTemplate(), ctx);

            // 3. HTML → PDF
            return htmlToPdf(html);

        } catch (DocumentException | java.io.IOException e) {
            log.error("CV render failed: cvId={} template={} error={}",
                    cv.getId(), template.getThymeleafTemplate(), e.getMessage(), e);
            throw new BusinessRuleException(
                    "Không thể tạo file PDF. Vui lòng thử lại.", "CV_RENDER_FAILED");
        }
    }

    // ── Context builder ───────────────────────────────────────────────────────

    private Context buildContext(OnlineCV cv) {
        Context ctx = new Context();

        // Personal info
        ctx.setVariable("cv", cv);
        ctx.setVariable("personalInfo", cv.getPersonalInfo());

        // Group visible sections theo type để template dễ dùng
        Map<String, List<CVSection>> sectionsByType = new LinkedHashMap<>();
        for (CVSection s : cv.getVisibleSections()) {
            sectionsByType
                    .computeIfAbsent(s.getType().name(), k -> new java.util.ArrayList<>())
                    .add(s);
        }
        ctx.setVariable("sectionsByType", sectionsByType);

        // Danh sách sections theo thứ tự để template dạng linear
        ctx.setVariable("sections", cv.getVisibleSections());

        return ctx;
    }

    // ── Flying Saucer PDF render ──────────────────────────────────────────────

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