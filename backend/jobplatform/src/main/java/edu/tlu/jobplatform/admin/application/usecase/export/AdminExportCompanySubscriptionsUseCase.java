package edu.tlu.jobplatform.admin.application.usecase.export;

import edu.tlu.jobplatform.admin.application.usecase.AdminSubscriptionUseCase;
import edu.tlu.jobplatform.shared.export.*;
import edu.tlu.jobplatform.subscription.domain.model.CompanySubscription;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminExportCompanySubscriptionsUseCase {

    private final AdminSubscriptionUseCase adminSubscriptionUseCase;
    private final ExcelExportService excelExportService;
    private final PdfExportService pdfExportService;

    // ── Column definitions ────────────────────────────────────────────────────

    private static final List<ExportColumn<CompanySubscription>> COLUMNS = List.of(
            ExportColumn.of("Company ID",
                    s -> s.getCompanyId() != null ? s.getCompanyId().toString() : "", 36),
            ExportColumn.of("Gói",
                    CompanySubscription::getPlanCode, 16),
            ExportColumn.of("Loại",
                    s -> s.isYearly() ? "Năm" : "Tháng", 10),
            ExportColumn.of("Trạng thái",
                    s -> s.getStatus() != null ? s.getStatus().name() : "", 14),
            ExportColumn.of("Tin đăng (còn)",
                    s -> s.getJobPostQuota() != null
                            ? String.valueOf(s.getJobPostQuota().getLimit())
                            : "",
                    14),
            ExportColumn.of("AI Features",
                    s -> s.isAiFeatures() ? "Có" : "Không", 10),
            ExportColumn.of("Analytics",
                    s -> s.isAnalyticsAccess() ? "Có" : "Không", 10),
            ExportColumn.of("Bắt đầu",
                    s -> s.getStartedAt() != null
                            ? s.getStartedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                            : "",
                    14),
            ExportColumn.of("Hết hạn",
                    s -> s.getExpiresAt() != null
                            ? s.getExpiresAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                            : "",
                    14),
            ExportColumn.of("Còn lại (ngày)",
                    s -> s.isActive() ? String.valueOf(s.daysRemaining()) : "0", 14),
            ExportColumn.of("Ngày tạo",
                    s -> s.getCreatedAt() != null
                            ? s.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                            : "",
                    14));

    // ── Enum ──────────────────────────────────────────────────────────────────

    public enum Format {
        EXCEL, PDF
    }

    // ── Execute ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ExportResult execute(Format format) {
        log.info("Export company subscriptions — format={}", format);

        List<CompanySubscription> data = adminSubscriptionUseCase.listAllForExport();
        ExportRequest<CompanySubscription> req = buildRequest(data);

        return switch (format) {
            case EXCEL -> excelExportService.export(req);
            case PDF -> pdfExportService.export(req);
        };
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private ExportRequest<CompanySubscription> buildRequest(List<CompanySubscription> data) {
        String generatedAt = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        return ExportRequest.<CompanySubscription>builder()
                .title("Danh sách đăng ký Employer")
                .filename("company_subscriptions")
                .subtitle("Xuất ngày: " + generatedAt)
                .columns(COLUMNS)
                .data(data)
                .build();
    }
}