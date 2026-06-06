package edu.tlu.jobplatform.admin.application.usecase.export;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.payment.application.usecase.admin.AdminPaymentUseCase;
import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.shared.export.ExportException;
import edu.tlu.jobplatform.shared.export.ExportResult;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import org.springframework.transaction.annotation.Propagation;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminExportInvoiceUseCase {

    private final AdminPaymentUseCase adminPaymentUseCase;
    private final UserRepository userRepo;
    private final CompanyRepository companyRepo;

    private static final String FONT_REGULAR = "/fonts/DejaVuSans.ttf";
    private static final String FONT_BOLD = "/fonts/DejaVuSans-Bold.ttf";
    private static final Color COLOR_HEADER = new Color(0x1E, 0x40, 0xAF);
    private static final Color COLOR_LINE = new Color(0xD1, 0xD5, 0xDB);

    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public ExportResult execute(UUID paymentId) {
        Payment payment = adminPaymentUseCase.getById(paymentId);
        log.info("Export invoice: paymentId={}", paymentId);
        return generateInvoice(payment);
    }

    private ExportResult generateInvoice(Payment payment) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Document doc = new Document(PageSize.A4, 50, 50, 60, 50);
            PdfWriter.getInstance(doc, out);
            doc.open();

            BaseFont bfRegular = BaseFont.createFont(FONT_REGULAR, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            BaseFont bfBold = BaseFont.createFont(FONT_BOLD, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);

            Font fontTitle = new Font(bfBold, 20, Font.NORMAL, COLOR_HEADER);
            Font fontHeader = new Font(bfBold, 11, Font.NORMAL, Color.WHITE);
            Font fontLabel = new Font(bfBold, 10, Font.NORMAL, Color.DARK_GRAY);
            Font fontValue = new Font(bfRegular, 10, Font.NORMAL, Color.DARK_GRAY);
            Font fontSmall = new Font(bfRegular, 8, Font.NORMAL, Color.GRAY);
            Font fontTotal = new Font(bfBold, 13, Font.NORMAL, COLOR_HEADER);

            // ── Logo / Tiêu đề ───────────────────────────────────────────
            Paragraph title = new Paragraph("HÓA ĐƠN THANH TOÁN", fontTitle);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(4f);
            doc.add(title);

            Paragraph platform = new Paragraph("TLU CareerUp", new Font(bfRegular, 10, Font.NORMAL, Color.GRAY));
            platform.setAlignment(Element.ALIGN_CENTER);
            platform.setSpacingAfter(20f);
            doc.add(platform);

            // ── Đường kẻ ─────────────────────────────────────────────────
            addLine(doc, COLOR_HEADER);

            // ── Thông tin hóa đơn ─────────────────────────────────────────
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100f);
            infoTable.setSpacingBefore(14f);
            infoTable.setSpacingAfter(14f);
            infoTable.setWidths(new float[] { 1f, 1f });

            // Cột trái — thông tin người thanh toán
            String payerName = resolvePayerName(payment);
            String payerType = payment.getCompanyId() != null ? "Employer" : "Candidate";

            addInfoCell(infoTable, "Người thanh toán", payerName, fontLabel, fontValue);
            addInfoCell(infoTable, "Mã hóa đơn", payment.getId().toString().substring(0, 8).toUpperCase(), fontLabel,
                    fontValue);
            addInfoCell(infoTable, "Loại tài khoản", payerType, fontLabel, fontValue);
            addInfoCell(infoTable, "Ngày thanh toán",
                    payment.getCompletedAt() != null
                            ? payment.getCompletedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                            : payment.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                    fontLabel, fontValue);
            doc.add(infoTable);

            addLine(doc, COLOR_LINE);

            // ── Bảng chi tiết ─────────────────────────────────────────────
            PdfPTable detailTable = new PdfPTable(4);
            detailTable.setWidthPercentage(100f);
            detailTable.setSpacingBefore(12f);
            detailTable.setSpacingAfter(12f);
            detailTable.setWidths(new float[] { 3f, 1f, 2f, 2f });

            // Header row
            String[] headers = { "Dịch vụ / Gói", "SL", "Đơn giá", "Thành tiền" };
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, fontHeader));
                cell.setBackgroundColor(COLOR_HEADER);
                cell.setPadding(8f);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setBorderColor(COLOR_HEADER);
                detailTable.addCell(cell);
            }

            // Data row
            String planCode = payment.getPlanCode() != null ? payment.getPlanCode() : "Gói dịch vụ";
            String amount = payment.getAmount() != null
                    ? formatCurrency(payment.getAmount().longValue(), payment.getCurrency())
                    : "0 VND";

            addDetailCell(detailTable, planCode, fontValue, Element.ALIGN_LEFT);
            addDetailCell(detailTable, "1", fontValue, Element.ALIGN_CENTER);
            addDetailCell(detailTable, amount, fontValue, Element.ALIGN_RIGHT);
            addDetailCell(detailTable, amount, fontValue, Element.ALIGN_RIGHT);
            doc.add(detailTable);

            addLine(doc, COLOR_LINE);

            // ── Tổng tiền ─────────────────────────────────────────────────
            PdfPTable totalTable = new PdfPTable(2);
            totalTable.setWidthPercentage(50f);
            totalTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalTable.setSpacingBefore(8f);
            totalTable.setSpacingAfter(20f);

            addTotalRow(totalTable, "Tổng cộng:", amount, fontLabel, fontValue);
            addTotalRow(totalTable, "Thuế (0%):", "0 VND", fontLabel, fontValue);

            PdfPCell totalLabel = new PdfPCell(new Phrase("TỔNG THANH TOÁN:", fontTotal));
            totalLabel.setBorder(Rectangle.TOP);
            totalLabel.setPaddingTop(6f);
            totalLabel.setBorderColorTop(COLOR_HEADER);
            totalTable.addCell(totalLabel);

            PdfPCell totalValue = new PdfPCell(new Phrase(amount, fontTotal));
            totalValue.setBorder(Rectangle.TOP);
            totalValue.setPaddingTop(6f);
            totalValue.setBorderColorTop(COLOR_HEADER);
            totalValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalTable.addCell(totalValue);
            doc.add(totalTable);

            // ── Trạng thái thanh toán ─────────────────────────────────────
            String statusText = payment.getStatus() != null ? payment.getStatus().name() : "UNKNOWN";
            Color statusColor = payment.isSuccess() ? new Color(0x16, 0xA3, 0x4A) : Color.RED;
            Paragraph statusPara = new Paragraph("Trạng thái: " + statusText,
                    new Font(bfBold, 11, Font.NORMAL, statusColor));
            statusPara.setAlignment(Element.ALIGN_CENTER);
            statusPara.setSpacingBefore(8f);
            doc.add(statusPara);

            // ── Cổng thanh toán ───────────────────────────────────────────
            if (payment.getGateway() != null) {
                Paragraph gateway = new Paragraph("Cổng thanh toán: " + payment.getGateway()
                        + (payment.getGatewayTransactionId() != null
                                ? " | Mã GD: " + payment.getGatewayTransactionId()
                                : ""),
                        fontSmall);
                gateway.setAlignment(Element.ALIGN_CENTER);
                doc.add(gateway);
            }

            // ── Footer ────────────────────────────────────────────────────
            addLine(doc, COLOR_LINE);
            Paragraph footer = new Paragraph(
                    "Cảm ơn bạn đã sử dụng dịch vụ TLU CareerUp!\n"
                            + "Hóa đơn được tạo tự động — không cần chữ ký.",
                    fontSmall);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(8f);
            doc.add(footer);

            doc.close();

            String filename = "invoice_" + payment.getId().toString().substring(0, 8) + ".pdf";
            return ExportResult.pdf(out.toByteArray(), filename);

        } catch (Exception e) {
            log.error("Invoice generation failed for paymentId: {}", e.getMessage(), e);
            throw new ExportException("Không thể tạo hóa đơn: " + e.getMessage(), e);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String resolvePayerName(Payment payment) {
        if (payment.getCompanyId() != null) {
            return companyRepo.findById(payment.getCompanyId())
                    .map(c -> c.getName()).orElse("Công ty không xác định");
        }
        if (payment.getCandidateId() != null) {
            return userRepo.findById(payment.getCandidateId())
                    .map(u -> u.getFullName() + " (" + u.getEmail() + ")")
                    .orElse("Ứng viên không xác định");
        }
        return "Không xác định";
    }

    private void addLine(Document doc, Color color) throws DocumentException {
        PdfPTable line = new PdfPTable(1);
        line.setWidthPercentage(100f);
        PdfPCell cell = new PdfPCell();
        cell.setFixedHeight(2f);
        cell.setBackgroundColor(color);
        cell.setBorder(Rectangle.NO_BORDER);
        line.addCell(cell);
        doc.add(line);
    }

    private void addInfoCell(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label + ":", labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPaddingBottom(4f);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPaddingBottom(4f);
        table.addCell(valueCell);
    }

    private void addDetailCell(PdfPTable table, String text, Font font, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(7f);
        cell.setHorizontalAlignment(align);
        cell.setBorderColor(COLOR_LINE);
        cell.setBorderWidth(0.5f);
        table.addCell(cell);
    }

    private void addTotalRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell l = new PdfPCell(new Phrase(label, labelFont));
        l.setBorder(Rectangle.NO_BORDER);
        l.setPaddingBottom(3f);
        table.addCell(l);

        PdfPCell v = new PdfPCell(new Phrase(value, valueFont));
        v.setBorder(Rectangle.NO_BORDER);
        v.setPaddingBottom(3f);
        v.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(v);
    }

    private String formatCurrency(long amount, String currency) {
        if ("USD".equalsIgnoreCase(currency))
            return String.format("$%,.2f", amount / 100.0);
        return String.format("%,d VND", amount);
    }
}