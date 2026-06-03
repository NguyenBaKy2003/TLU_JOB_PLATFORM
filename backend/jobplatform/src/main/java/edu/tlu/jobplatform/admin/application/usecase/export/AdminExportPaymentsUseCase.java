package edu.tlu.jobplatform.admin.application.usecase.export;

import edu.tlu.jobplatform.payment.application.usecase.admin.AdminPaymentUseCase;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import edu.tlu.jobplatform.payment.presentation.dto.response.AdminPaymentResponse;
import edu.tlu.jobplatform.shared.export.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminExportPaymentsUseCase {

    private final AdminPaymentUseCase adminPaymentUseCase;
    private final ExcelExportService excelExportService;
    private final PdfExportService pdfExportService;

    // ── Column definitions ────────────────────────────────────────────────────

    private static final List<ExportColumn<EnrichedPayment>> COLUMNS = List.of(
            ExportColumn.of("ID",
                    p -> p.payment().getId() != null ? p.payment().getId().toString() : "",
                    36),
            ExportColumn.of("Người thanh toán",
                    p -> p.payerName(),
                    28),
            ExportColumn.of("Loại tài khoản",
                    p -> p.payerType(),
                    14),
            ExportColumn.of("Gói / Mã đơn",
                    p -> p.payment().getPlanCode() != null ? p.payment().getPlanCode() : "",
                    18),
            ExportColumn.of("Số tiền",
                    p -> p.payment().getAmountFormatted() != null ? p.payment().getAmountFormatted() : "0",
                    14),
            ExportColumn.of("Tiền tệ",
                    p -> p.payment().getCurrency() != null ? p.payment().getCurrency() : "VND",
                    8),
            ExportColumn.of("Cổng thanh toán",
                    p -> p.payment().getGateway() != null ? p.payment().getGateway() : "",
                    14),
            ExportColumn.of("Trạng thái",
                    p -> p.payment().getStatus() != null ? p.payment().getStatus().name() : "",
                    14),
            ExportColumn.of("Mã giao dịch",
                    p -> p.payment().getGatewayTransactionId() != null
                            ? p.payment().getGatewayTransactionId()
                            : "",
                    28),
            ExportColumn.of("Ngày tạo",
                    p -> p.payment().getCreatedAt() != null
                            ? p.payment().getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                            : "",
                    18),
            ExportColumn.of("Ngày hoàn tất",
                    p -> p.payment().getCompletedAt() != null
                            ? p.payment().getCompletedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                            : "",
                    18));

    // ── Command / Format ──────────────────────────────────────────────────────

    public record Command(
            UUID companyId,
            UUID candidateId,
            PaymentStatus status,
            String gateway,
            LocalDateTime fromDate,
            LocalDateTime toDate) {
    }

    public enum Format {
        EXCEL, PDF
    }

    // ── Enriched wrapper ──────────────────────────────────────────────────────

    /**
     * AdminPaymentResponse đã chứa companyName/candidateName — không cần enrich lại
     */
    public record EnrichedPayment(
            AdminPaymentResponse payment,
            String payerName,
            String payerType) {
    }

    // ── Execute ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ExportResult execute(Command cmd, Format format) {
        log.info("Export payments — format={}, status={}", format, cmd.status());

        List<EnrichedPayment> data = fetchAll(cmd);
        ExportRequest<EnrichedPayment> req = buildRequest(cmd, data);

        return switch (format) {
            case EXCEL -> excelExportService.export(req);
            case PDF -> pdfExportService.export(req);
        };
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private List<EnrichedPayment> fetchAll(Command cmd) {
        var pageable = PageRequest.of(0, Integer.MAX_VALUE, Sort.by("createdAt").descending());
        return adminPaymentUseCase
                .search(cmd.companyId(), cmd.candidateId(), cmd.status(),
                        cmd.gateway(), cmd.fromDate(), cmd.toDate(), pageable)
                .getContent()
                .stream()
                .map(this::toEnriched)
                .toList();
    }

    private EnrichedPayment toEnriched(AdminPaymentResponse r) {
        // companyName/candidateName đã được AdminPaymentUseCase.enrich() resolve sẵn
        String payerName = r.getCompanyName() != null
                ? r.getCompanyName()
                : (r.getCandidateName() != null ? r.getCandidateName() : "Không xác định");
        String payerType = r.getCompanyId() != null ? "Employer"
                : r.getCandidateId() != null ? "Candidate"
                        : "—";
        return new EnrichedPayment(r, payerName, payerType);
    }

    private ExportRequest<EnrichedPayment> buildRequest(Command cmd, List<EnrichedPayment> data) {
        String generatedAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        return ExportRequest.<EnrichedPayment>builder()
                .title("Danh sách giao dịch thanh toán")
                .filename("payments")
                .subtitle("Xuất ngày: " + generatedAt + buildFilterDesc(cmd))
                .columns(COLUMNS)
                .data(data)
                .build();
    }

    private String buildFilterDesc(Command cmd) {
        var sb = new StringBuilder();
        if (cmd.status() != null)
            sb.append(" | Trạng thái: ").append(cmd.status().name());
        if (cmd.gateway() != null && !cmd.gateway().isBlank())
            sb.append(" | Cổng: ").append(cmd.gateway());
        if (cmd.fromDate() != null)
            sb.append(" | Từ: ").append(cmd.fromDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        if (cmd.toDate() != null)
            sb.append(" | Đến: ").append(cmd.toDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        return sb.toString();
    }
}