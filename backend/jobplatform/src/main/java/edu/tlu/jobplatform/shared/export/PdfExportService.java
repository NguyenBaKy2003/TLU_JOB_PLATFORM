package edu.tlu.jobplatform.shared.export;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
public class PdfExportService {

    // ── Màu sắc ───────────────────────────────────────────────────────────────
    private static final Color COLOR_HEADER_BG = new Color(0x3B, 0x82, 0xF6);
    private static final Color COLOR_ROW_ODD = new Color(0xEF, 0xF6, 0xFF);
    private static final Color COLOR_ROW_EVEN = Color.WHITE;
    private static final Color COLOR_TITLE = new Color(0x1E, 0x40, 0xAF);
    private static final Color COLOR_BORDER = new Color(0xD1, 0xD5, 0xDB);

    // ── Font paths (classpath) ────────────────────────────────────────────────
    private static final String FONT_REGULAR = "/fonts/DejaVuSans.ttf";
    private static final String FONT_BOLD = "/fonts/DejaVuSans-Bold.ttf";
    private static final String FONT_ITALIC = "/fonts/DejaVuSans-Oblique.ttf";

    // ── Font builders ─────────────────────────────────────────────────────────

    private Font buildFont(String classpathPath, float size, Color color) {
        try {
            BaseFont bf = BaseFont.createFont(
                    classpathPath,
                    BaseFont.IDENTITY_H, // Unicode full — bắt buộc cho tiếng Việt
                    BaseFont.EMBEDDED); // nhúng font vào PDF
            return new Font(bf, size, Font.NORMAL, color);
        } catch (Exception e) {
            log.warn("Không load được font '{}', fallback Helvetica: {}", classpathPath, e.getMessage());
            return FontFactory.getFont(FontFactory.HELVETICA, size, color);
        }
    }

    // ── Public API ────────────────────────────────────────────────────────────

    public <T> ExportResult export(ExportRequest<T> request) {
        log.debug("PDF export: title='{}', rows={}", request.getTitle(), request.getData().size());

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Document doc = new Document(PageSize.A4.rotate(), 30, 30, 40, 30);
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            writer.setPageEvent(new PageHeaderFooter(request.getTitle(), buildFont(FONT_REGULAR, 7, Color.GRAY)));

            doc.open();
            addTitle(doc, request.getTitle());
            addSubtitle(doc, request.getSubtitle());
            addTable(doc, request.getColumns(), request.getData());
            doc.close();

            String ts = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String name = request.getFilename() + "_" + ts;
            return ExportResult.pdf(out.toByteArray(), name);

        } catch (Exception e) {
            log.error("PDF export failed for '{}': {}", request.getTitle(), e.getMessage(), e);
            throw new ExportException("Không thể tạo file PDF: " + e.getMessage(), e);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void addTitle(Document doc, String title) throws DocumentException {
        Font font = buildFont(FONT_BOLD, 16, COLOR_TITLE);
        Paragraph p = new Paragraph(title, font);
        p.setAlignment(Element.ALIGN_CENTER);
        p.setSpacingAfter(4f);
        doc.add(p);
    }

    private void addSubtitle(Document doc, String subtitle) throws DocumentException {
        String text = subtitle != null ? subtitle
                : "Xuất ngày: " + LocalDateTime.now()
                        .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        Font font = buildFont(FONT_ITALIC, 9, Color.GRAY);
        Paragraph p = new Paragraph(text, font);
        p.setAlignment(Element.ALIGN_CENTER);
        p.setSpacingAfter(12f);
        doc.add(p);
    }

    private <T> void addTable(Document doc, List<ExportColumn<T>> columns, List<T> data)
            throws DocumentException {

        Font headerFont = buildFont(FONT_BOLD, 9, Color.WHITE);
        Font dataFont = buildFont(FONT_REGULAR, 8, Color.DARK_GRAY);
        Font emptyFont = buildFont(FONT_ITALIC, 9, Color.GRAY);

        PdfPTable table = new PdfPTable(columns.size());
        table.setWidthPercentage(100f);
        table.setSpacingBefore(4f);
        table.setKeepTogether(false);
        table.setWidths(buildWidths(columns));

        // ── Header ────────────────────────────────────────────────────────
        for (ExportColumn<T> col : columns) {
            PdfPCell cell = new PdfPCell(new Phrase(col.getHeader(), headerFont));
            cell.setBackgroundColor(COLOR_HEADER_BG);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setPadding(6f);
            cell.setBorderColor(COLOR_HEADER_BG);
            table.addCell(cell);
        }

        // ── Dữ liệu ──────────────────────────────────────────────────────
        for (int i = 0; i < data.size(); i++) {
            T item = data.get(i);
            Color bg = (i % 2 == 0) ? COLOR_ROW_EVEN : COLOR_ROW_ODD;

            for (ExportColumn<T> col : columns) {
                String text = formatValue(col.getValueExtractor().apply(item));
                PdfPCell cell = new PdfPCell(new Phrase(text, dataFont));
                cell.setBackgroundColor(bg);
                cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
                cell.setPadding(5f);
                cell.setBorderColor(COLOR_BORDER);
                cell.setBorderWidth(0.5f);
                table.addCell(cell);
            }
        }

        // ── Empty state ───────────────────────────────────────────────────
        if (data.isEmpty()) {
            PdfPCell empty = new PdfPCell(new Phrase("Không có dữ liệu", emptyFont));
            empty.setColspan(columns.size());
            empty.setHorizontalAlignment(Element.ALIGN_CENTER);
            empty.setPadding(10f);
            empty.setBorderColor(COLOR_BORDER);
            table.addCell(empty);
        }

        doc.add(table);
    }

    private <T> float[] buildWidths(List<ExportColumn<T>> columns) {
        float[] widths = new float[columns.size()];
        for (int i = 0; i < columns.size(); i++) {
            Integer w = columns.get(i).getWidth();
            widths[i] = w != null ? w : 20f;
        }
        return widths;
    }

    private String formatValue(Object value) {
        if (value == null)
            return "";
        if (value instanceof Boolean b)
            return b ? "Có" : "Không";
        if (value instanceof LocalDate d)
            return d.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        if (value instanceof LocalDateTime dt)
            return dt.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        return value.toString();
    }

    // ── Page header/footer ────────────────────────────────────────────────────

    private static class PageHeaderFooter extends PdfPageEventHelper {
        private final String title;
        private final Font footerFont;

        PageHeaderFooter(String title, Font footerFont) {
            this.title = title;
            this.footerFont = footerFont;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                    new Phrase("Trang " + writer.getPageNumber(), footerFont),
                    document.right(), document.bottom() - 10, 0);
            ColumnText.showTextAligned(cb, Element.ALIGN_LEFT,
                    new Phrase(title, footerFont),
                    document.left(), document.bottom() - 10, 0);
        }
    }
}