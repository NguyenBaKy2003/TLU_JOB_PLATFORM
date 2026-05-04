package edu.tlu.jobplatform.candidate.infrastructure.file;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import edu.tlu.jobplatform.candidate.application.port.out.CVParserPort;

import java.io.InputStream;

@Slf4j
@Component
public class ApachePDFParserAdapter implements CVParserPort {

    private static final String PDF_TYPE = "application/pdf";

    @Override
    public String parse(InputStream inputStream, String contentType) {
        if (!PDF_TYPE.equalsIgnoreCase(contentType)) {
            log.debug("CVParser: skipping non-PDF content type={}", contentType);
            return "";
        }

        try {
            byte[] bytes = inputStream.readAllBytes();

            try (PDDocument document = Loader.loadPDF(bytes)) { // PDFBox 3.x API
                if (document.isEncrypted()) {
                    log.warn("CVParser: PDF is encrypted, skipping parse");
                    return "";
                }

                PDFTextStripper stripper = new PDFTextStripper();
                stripper.setSortByPosition(true);
                String text = stripper.getText(document);

                log.debug("CVParser: parsed {} chars from PDF", text.length());
                return text.trim();
            }

        } catch (Exception e) {
            log.warn("CVParser: failed to parse PDF — {}", e.getMessage());
            return "";
        }
    }
}