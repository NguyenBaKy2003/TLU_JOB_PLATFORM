package edu.tlu.jobplatform.admin.application.usecase.export;

import edu.tlu.jobplatform.admin.application.usecase.AdminCandidateSubscriptionUseCase;
import edu.tlu.jobplatform.shared.export.*;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscription;
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
public class AdminExportCandidateSubscriptionsUseCase {

    private final AdminCandidateSubscriptionUseCase adminCandidateSubscriptionUseCase;
    private final ExcelExportService excelExportService;
    private final PdfExportService pdfExportService;

    // ── Column definitions ────────────────────────────────────────────────────

    private static final List<ExportColumn<CandidateSubscription>> COLUMNS = List.of(
            ExportColumn.of("Candidate ID",
                    s -> s.getCandidateId() != null ? s.getCandidateId().toString() : "", 36),
            ExportColumn.of("Gói",
                    CandidateSubscription::getPlanCode, 16),
            ExportColumn.of("Loại",
                    s -> s.isYearly() ? "Năm" : "Tháng", 10),
            ExportColumn.of("Trạng thái",
                    s -> s.getStatus() != null ? s.getStatus().name() : "", 14),
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
            ExportColumn.of("AI Writer",
                    s -> s.isAiCvWriter() ? "Có" : "Không", 10),
            ExportColumn.of("Template Premium",
                    s -> s.isPremiumTemplateAccess() ? "Có" : "Không", 14),
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
        log.info("Export candidate subscriptions — format={}", format);

        List<CandidateSubscription> data = adminCandidateSubscriptionUseCase.listAllForExport();
        ExportRequest<CandidateSubscription> req = buildRequest(data);

        return switch (format) {
            case EXCEL -> excelExportService.export(req);
            case PDF -> pdfExportService.export(req);
        };
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private ExportRequest<CandidateSubscription> buildRequest(List<CandidateSubscription> data) {
        String generatedAt = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        return ExportRequest.<CandidateSubscription>builder()
                .title("Danh sách đăng ký Candidate")
                .filename("candidate_subscriptions")
                .subtitle("Xuất ngày: " + generatedAt)
                .columns(COLUMNS)
                .data(data)
                .build();
    }
}