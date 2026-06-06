package edu.tlu.jobplatform.shared.export;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

/**
 * Kết quả xuất file: byte[] + metadata để build HTTP response.
 */
@Getter
@RequiredArgsConstructor
public class ExportResult {

    private final byte[] bytes;
    private final String contentType;
    private final String filename; // bao gồm extension

    // ── Factory ─────────────

    public static ExportResult excel(byte[] bytes, String filename) {
        return new ExportResult(
                bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                filename.endsWith(".xlsx") ? filename : filename + ".xlsx");
    }

    public static ExportResult pdf(byte[] bytes, String filename) {
        return new ExportResult(
                bytes,
                MediaType.APPLICATION_PDF_VALUE,
                filename.endsWith(".pdf") ? filename : filename + ".pdf");
    }

    // ── Helpers ──────────────

    /** Build ResponseEntity sẵn dùng trong Controller */
    public ResponseEntity<byte[]> toResponseEntity() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(bytes);
    }
}