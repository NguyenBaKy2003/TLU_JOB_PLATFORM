package edu.tlu.jobplatform.cv.infrastructure.render;

import com.lowagie.text.DocumentException;

import edu.tlu.jobplatform.cv.application.port.out.CVRenderPort;
import edu.tlu.jobplatform.cv.domain.model.CVSection;
import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Implements CVRenderPort.
 *
 * Fix tieng Viet:
 * Flying Saucer can font TTF duoc nhung (embedded) vao ITextFontResolver.
 * Su dung Roboto tu classpath: src/main/resources/fonts/Roboto-*.ttf
 * Trong CSS template phai khai bao: font-family: "Roboto", sans-serif;
 * 
 * Giai phap: Copy font tu classpath ra temp file de Flying Saucer co the doc
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
        String html = processTemplate(cv, template);
        try {
            return htmlToPdf(html);
        } catch (DocumentException | IOException e) {
            log.error("CV render to PDF failed: cvId={} templateId={} error={}",
                    cv.getId(), template.getId(), e.getMessage(), e);
            throw new BusinessRuleException(
                    "Khong the tao file PDF. Vui long thu lai.", "CV_RENDER_FAILED");
        }
    }

    public String renderHtml(OnlineCV cv, CVTemplate template) {
        return processTemplate(cv, template);
    }

    private String processTemplate(OnlineCV cv, CVTemplate template) {
        if (template.getHtmlContent() == null || template.getHtmlContent().isBlank()) {
            throw new BusinessRuleException(
                    "Template chua co noi dung HTML.", "TEMPLATE_CONTENT_EMPTY");
        }
        return cvTemplateEngine.process(template.getHtmlContent(), buildContext(cv));
    }

    private Context buildContext(OnlineCV cv) {
        Context ctx = new Context();
        ctx.setVariable("cv", cv);
        ctx.setVariable("personalInfo", cv.getPersonalInfo());

        Map<String, List<CVSection>> sectionsByType = new LinkedHashMap<>();
        for (CVSection s : cv.getVisibleSections()) {
            sectionsByType
                    .computeIfAbsent(s.getType().name(), k -> new ArrayList<>())
                    .add(s);
        }
        ctx.setVariable("sectionsByType", sectionsByType);
        ctx.setVariable("sections", cv.getVisibleSections());
        return ctx;
    }

    /**
     * XHTML -> PDF.
     * Load font Roboto truoc khi render de hien thi tieng Viet.
     */
    private byte[] htmlToPdf(String html) throws DocumentException, IOException {
        List<Path> tempFonts = new ArrayList<>();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            loadFonts(renderer, tempFonts);

            // Parse HTML string → DOM Document với encoding UTF-8
            org.w3c.dom.Document document = parseXhtml(html);
            renderer.setDocument(document, null);

            renderer.layout();
            renderer.createPDF(out);
            return out.toByteArray();
        } finally {
            for (Path p : tempFonts) {
                try {
                    Files.deleteIfExists(p);
                } catch (IOException e) {
                    log.debug("Failed to delete temp font: {}", p);
                }
            }
        }
    }

    private org.w3c.dom.Document parseXhtml(String html) throws IOException {
        try {
            byte[] htmlBytes = html.getBytes(StandardCharsets.UTF_8);
            javax.xml.parsers.DocumentBuilderFactory factory = javax.xml.parsers.DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);

            // Tắt validation để tránh lỗi DTD network fetch
            factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
            factory.setFeature("http://xml.org/sax/features/validation", false);

            javax.xml.parsers.DocumentBuilder builder = factory.newDocumentBuilder();

            // Suppress warning "unknown entity" khi DTD bị tắt
            builder.setErrorHandler(new org.xml.sax.ErrorHandler() {
                public void warning(org.xml.sax.SAXParseException e) {
                    log.debug("XHTML parse warning: {}", e.getMessage());
                }

                public void error(org.xml.sax.SAXParseException e) {
                    log.warn("XHTML parse error: {}", e.getMessage());
                }

                public void fatalError(org.xml.sax.SAXParseException e) throws org.xml.sax.SAXParseException {
                    throw e;
                }
            });

            return builder.parse(new java.io.ByteArrayInputStream(htmlBytes));
        } catch (Exception e) {
            throw new IOException("Failed to parse XHTML template: " + e.getMessage(), e);
        }
    }

    /**
     * Copy font tu classpath ra temp file, sau do add vao renderer.
     * 
     * Ly do: Flying Saucer 9.x chi ho tro addFont(String path, boolean embedded)
     * va can file thuc te tren disk de doc font, khong doc duoc tu classpath/JAR.
     * 
     * Temp file se duoc xoa khi JVM shutdown hoac ngay sau khi add font.
     */
    private void loadFonts(ITextRenderer renderer, List<Path> tempFonts) {
        String[] fontFiles = {
                "fonts/NotoSans-Regular.ttf",
                "fonts/NotoSans-Bold.ttf",
                "fonts/DejaVuSans.ttf",
                "fonts/DejaVuSans-Bold.ttf",
                "fonts/DejaVuSans-Oblique.ttf",
        };

        for (String fontPath : fontFiles) {
            try {
                ClassPathResource resource = new ClassPathResource(fontPath);
                if (!resource.exists()) {
                    log.warn("Font file not found: {}", fontPath);
                    continue;
                }

                String fileName = fontPath.substring(fontPath.lastIndexOf('/') + 1);
                Path tempFile = Files.createTempFile("font-", "-" + fileName);
                tempFonts.add(tempFile);

                try (InputStream fontStream = resource.getInputStream()) {
                    Files.copy(fontStream, tempFile, StandardCopyOption.REPLACE_EXISTING);
                }

                renderer.getFontResolver().addFont(
                        tempFile.toAbsolutePath().toString(),
                        com.lowagie.text.pdf.BaseFont.IDENTITY_H,
                        true);
                log.info("Font registered: {}", fontPath);
            } catch (Exception e) {
                log.warn("Failed to load font {}: {}", fontPath, e.getMessage());
            }
        }
    }
}