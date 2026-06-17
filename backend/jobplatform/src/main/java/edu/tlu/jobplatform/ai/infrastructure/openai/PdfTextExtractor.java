package edu.tlu.jobplatform.ai.infrastructure.openai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.Normalizer;
import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class PdfTextExtractor {

    private static final int MAX_CHARS = 8000;

    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket}")
    private String bucket;

    private static final HttpClient HTTP = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    public String extractFromUrl(String pdfUrl) {
        if (pdfUrl == null || pdfUrl.isBlank())
            return "";

        try {
            String downloadUrl = toPresignedUrl(pdfUrl);
            return downloadAndExtract(downloadUrl);
        } catch (Exception e) {
            log.error("PDF extraction failed: url={}", pdfUrl, e);
            return "";
        }
    }

    private String toPresignedUrl(String s3Url) {
        String path = URI.create(s3Url).getPath();
        String key = path.startsWith("/") ? path.substring(1) : path;
        log.info("S3 key extracted: '{}'", key);
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10))
                .getObjectRequest(r -> r.bucket(bucket).key(key))
                .build();

        String presignedUrl = s3Presigner.presignGetObject(presignRequest).url().toString();
        log.info("Presigned URL: {}", presignedUrl.substring(0, 80) + "..."); // thêm dòng này
        return presignedUrl;
    }

    private String downloadAndExtract(String url) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(20))
                .GET().build();

        HttpResponse<InputStream> response = HTTP.send(
                request, HttpResponse.BodyHandlers.ofInputStream());

        log.info("PDF download status: {}", response.statusCode());

        if (response.statusCode() != 200) {
            log.warn("Failed to download PDF: status={}", response.statusCode());
            return "";
        }

        try (InputStream is = response.body()) {
            byte[] bytes = is.readAllBytes();
            log.info("PDF bytes downloaded: {}", bytes.length);

            PDDocument doc = Loader.loadPDF(bytes);
            try {
                if (doc.isEncrypted()) {
                    log.warn("PDF is encrypted");
                    return "";
                }
                PDFTextStripper stripper = new PDFTextStripper();
                stripper.setSortByPosition(true);
                String text = stripper.getText(doc).trim();

                text = sanitizeExtractedText(text);

                log.info("PDF text extracted: {} chars", text.length()); // thêm
                return text.length() > MAX_CHARS
                        ? text.substring(0, MAX_CHARS) + "...[truncated]"
                        : text;
            } finally {
                doc.close();
            }
        }
    }

    private String sanitizeExtractedText(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }

        String cleaned = text
                .replace("\u0000", "")
                .replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]", "")
                .replace("\uFFFD", "");

        cleaned = Normalizer.normalize(cleaned, Normalizer.Form.NFC);

        return cleaned.trim();
    }
}