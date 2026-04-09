package edu.tlu.jobplatform.ai.infrastructure.openai;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Slf4j
@Component
public class PdfTextExtractor {

    private static final int MAX_CHARS = 8000;

    private static final HttpClient HTTP = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    public String extractFromUrl(String pdfUrl) {
        if (pdfUrl == null || pdfUrl.isBlank()) {
            return "";
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(pdfUrl))
                    .timeout(Duration.ofSeconds(20))
                    .header("User-Agent", "Mozilla/5.0")
                    .GET()
                    .build();

            HttpResponse<InputStream> response = HTTP.send(request, HttpResponse.BodyHandlers.ofInputStream());

            if (response.statusCode() != 200) {
                log.warn("Failed to download PDF: url={}, status={}", pdfUrl, response.statusCode());
                return "";
            }

            try (InputStream inputStream = response.body()) {
                PDDocument document = Loader.loadPDF(inputStream.readAllBytes());

                if (document.isEncrypted()) {
                    log.warn("PDF is encrypted: url={}", pdfUrl);
                    return "";
                }

                PDFTextStripper stripper = new PDFTextStripper();
                stripper.setSortByPosition(true);

                String text = stripper.getText(document);

                if (text == null || text.isBlank()) {
                    return "";
                }

                text = text.trim();

                // Giới hạn độ dài
                if (text.length() > MAX_CHARS) {
                    text = text.substring(0, MAX_CHARS) + "...[truncated]";
                }

                return text;
            }

        } catch (Exception e) {
            log.error("PDF extraction failed: url={}", pdfUrl, e);
            return "";
        }
    }
}