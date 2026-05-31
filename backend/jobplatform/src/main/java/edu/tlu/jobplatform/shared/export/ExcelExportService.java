package edu.tlu.jobplatform.shared.export;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;

/**
 * Xuất Excel (.xlsx) từ bất kỳ danh sách dữ liệu nào.
 * Dùng Apache POI — không phụ thuộc domain cụ thể.
 *
 * <pre>
 * ExportRequest<AdminUserDto> req = ExportRequest.<AdminUserDto>builder()
 *         .title("Danh sách người dùng")
 *         .filename("users")
 *         .data(users)
 *         .columns(List.of(
 *                 ExportColumn.of("Họ tên", AdminUserDto::getFullName),
 *                 ExportColumn.of("Email", AdminUserDto::getEmail),
 *                 ExportColumn.of("Vai trò", AdminUserDto::getRole),
 *                 ExportColumn.of("Trạng thái", u -> u.isActive() ? "Hoạt động" : "Khóa")))
 *         .build();
 *
 * ExportResult result = excelExportService.export(req);
 * return result.toResponseEntity();
 * </pre>
 */
@Slf4j
@Service
public class ExcelExportService {

    private static final int TITLE_ROW_HEIGHT = 600; // twips
    private static final short TITLE_FONT_SIZE = 14;
    private static final short HEADER_FONT_SIZE = 11;
    private static final int DEFAULT_COL_WIDTH = 20; // characters

    public <T> ExportResult export(ExportRequest<T> request) {
        log.debug("Excel export: title='{}', rows={}", request.getTitle(), request.getData().size());

        try (XSSFWorkbook wb = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = wb.createSheet(truncate(request.getTitle(), 31));
            sheet.setDefaultColumnWidth(DEFAULT_COL_WIDTH);

            int rowIdx = 0;

            // ── Title row ─────────────────────────────────────────────────
            rowIdx = writeTitleRow(wb, sheet, request.getTitle(), request.getColumns().size(), rowIdx);

            // ── Subtitle / generated-at row ───────────────────────────────
            rowIdx = writeMetaRow(wb, sheet, request, rowIdx);

            // ── Empty spacer ──────────────────────────────────────────────
            sheet.createRow(rowIdx++);

            // ── Header row ────────────────────────────────────────────────
            rowIdx = writeHeaderRow(wb, sheet, request.getColumns(), rowIdx);

            // ── Data rows ─────────────────────────────────────────────────
            writeDataRows(wb, sheet, request.getColumns(), request.getData(), rowIdx);

            // ── Auto-size columns ─────────────────────────────────────────
            autoSizeColumns(sheet, request.getColumns());

            wb.write(out);
            String ts = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String name = request.getFilename() + "_" + ts;
            return ExportResult.excel(out.toByteArray(), name);

        } catch (Exception e) {
            log.error("Excel export failed for '{}': {}", request.getTitle(), e.getMessage(), e);
            throw new ExportException("Không thể tạo file Excel: " + e.getMessage(), e);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private int writeTitleRow(Workbook wb, Sheet sheet, String title, int colCount, int rowIdx) {
        Row row = sheet.createRow(rowIdx);
        row.setHeight((short) TITLE_ROW_HEIGHT);

        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setFontHeightInPoints(TITLE_FONT_SIZE);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        Cell cell = row.createCell(0);
        cell.setCellValue(title);
        cell.setCellStyle(style);

        if (colCount > 1) {
            sheet.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, 0, colCount - 1));
        }
        return rowIdx + 1;
    }

    private <T> int writeMetaRow(Workbook wb, Sheet sheet, ExportRequest<T> request, int rowIdx) {
        String meta = request.getSubtitle() != null
                ? request.getSubtitle()
                : "Xuất ngày: " + LocalDateTime.now()
                        .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

        Row row = sheet.createRow(rowIdx);
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setItalic(true);
        font.setFontHeightInPoints((short) 10);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);

        Cell cell = row.createCell(0);
        cell.setCellValue(meta);
        cell.setCellStyle(style);

        int colCount = request.getColumns().size();
        if (colCount > 1) {
            sheet.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, 0, colCount - 1));
        }
        return rowIdx + 1;
    }

    private <T> int writeHeaderRow(Workbook wb, Sheet sheet, List<ExportColumn<T>> columns, int rowIdx) {
        Row row = sheet.createRow(rowIdx);

        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setFontHeightInPoints(HEADER_FONT_SIZE);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);

        // White font for dark header background
        font.setColor(IndexedColors.WHITE.getIndex());

        for (int i = 0; i < columns.size(); i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(columns.get(i).getHeader());
            cell.setCellStyle(style);
        }
        return rowIdx + 1;
    }

    private <T> void writeDataRows(Workbook wb, Sheet sheet, List<ExportColumn<T>> columns,
            List<T> data, int startRowIdx) {
        CellStyle evenStyle = buildDataStyle(wb, IndexedColors.WHITE);
        CellStyle oddStyle = buildDataStyle(wb, IndexedColors.LIGHT_CORNFLOWER_BLUE);

        for (int i = 0; i < data.size(); i++) {
            Row row = sheet.createRow(startRowIdx + i);
            CellStyle rowStyle = (i % 2 == 0) ? evenStyle : oddStyle;
            T item = data.get(i);

            for (int j = 0; j < columns.size(); j++) {
                Cell cell = row.createCell(j);
                Object value = columns.get(j).getValueExtractor().apply(item);
                setCellValue(cell, value);
                cell.setCellStyle(rowStyle);
            }
        }
    }

    private CellStyle buildDataStyle(Workbook wb, IndexedColors bgColor) {
        CellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(bgColor.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        return style;
    }

    private void setCellValue(Cell cell, Object value) {
        if (value == null) {
            cell.setCellValue("");
        } else if (value instanceof Number n) {
            cell.setCellValue(n.doubleValue());
        } else if (value instanceof Boolean b) {
            cell.setCellValue(b ? "Có" : "Không");
        } else if (value instanceof LocalDate d) {
            cell.setCellValue(d.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        } else if (value instanceof LocalDateTime dt) {
            cell.setCellValue(dt.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        } else if (value instanceof Date d) {
            cell.setCellValue(d);
        } else {
            cell.setCellValue(value.toString());
        }
    }

    private <T> void autoSizeColumns(Sheet sheet, List<ExportColumn<T>> columns) {
        for (int i = 0; i < columns.size(); i++) {
            Integer w = columns.get(i).getWidth();
            if (w != null) {
                sheet.setColumnWidth(i, w * 256);
            } else {
                sheet.autoSizeColumn(i);
                // Thêm padding nhỏ sau auto-size
                int current = sheet.getColumnWidth(i);
                sheet.setColumnWidth(i, Math.min(current + 512, 65280));
            }
        }
    }

    private String truncate(String s, int maxLen) {
        return s != null && s.length() > maxLen ? s.substring(0, maxLen) : s;
    }
}