package edu.tlu.jobplatform.admin.application.usecase.export;

import edu.tlu.jobplatform.company.domain.model.CompanyReview;
import edu.tlu.jobplatform.company.domain.model.ReviewStatus;
import edu.tlu.jobplatform.company.domain.repository.CompanyReviewRepository;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminExportReviewsUseCase {

    private final CompanyReviewRepository reviewRepository;
    private final ExcelExportService excelExportService;
    private final PdfExportService pdfExportService;

    // ── Column definitions ────────────────────────────────────────────────────

    private static final List<ExportColumn<CompanyReview>> COLUMNS = List.of(
            ExportColumn.of("ID",
                    r -> r.getId() != null ? r.getId().toString() : "", 36),
            ExportColumn.of("Company ID",
                    r -> r.getCompanyId() != null ? r.getCompanyId().toString() : "", 36),
            ExportColumn.of("Tiêu đề",
                    r -> r.getTitle() != null ? r.getTitle() : "", 28),
            ExportColumn.of("Nội dung",
                    r -> r.getContent() != null ? r.getContent() : "", 40),
            ExportColumn.of("Điểm tốt",
                    r -> r.getPros() != null ? r.getPros() : "", 28),
            ExportColumn.of("Điểm chưa tốt",
                    r -> r.getCons() != null ? r.getCons() : "", 28),
            ExportColumn.of("Số sao",
                    r -> String.valueOf(r.getRating()), 10),
            ExportColumn.of("Ẩn danh",
                    r -> r.isAnonymous() ? "Có" : "Không", 10),
            ExportColumn.of("Đang làm việc",
                    r -> r.isEmployed() ? "Có" : "Không", 12),
            ExportColumn.of("Trạng thái",
                    r -> r.getStatus() != null ? r.getStatus().name() : "", 14),
            ExportColumn.of("Lý do từ chối",
                    r -> r.getRejectionReason() != null ? r.getRejectionReason() : "", 30),
            ExportColumn.of("Ngày tạo",
                    r -> r.getCreatedAt() != null
                            ? r.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                            : "",
                    18),
            ExportColumn.of("Ngày duyệt/từ chối",
                    r -> r.getReviewedAt() != null
                            ? r.getReviewedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                            : "",
                    18));

    // ── Command / Format ──────────────────────────────────────────────────────

    public record Command(ReviewStatus status) {
    }

    public enum Format {
        EXCEL, PDF
    }

    // ── Execute ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ExportResult execute(Command cmd, Format format) {
        log.info("Export reviews — format={}, status={}", format, cmd.status());

        List<CompanyReview> data = fetchAll(cmd);
        ExportRequest<CompanyReview> req = buildRequest(cmd, data);

        return switch (format) {
            case EXCEL -> excelExportService.export(req);
            case PDF -> pdfExportService.export(req);
        };
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private List<CompanyReview> fetchAll(Command cmd) {
        var pageable = PageRequest.of(0, Integer.MAX_VALUE,
                Sort.by("createdAt").descending());
        return reviewRepository
                .findByStatus(cmd.status(), pageable)
                .getContent();
    }

    private ExportRequest<CompanyReview> buildRequest(Command cmd, List<CompanyReview> data) {
        String generatedAt = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        return ExportRequest.<CompanyReview>builder()
                .title("Danh sách đánh giá công ty")
                .filename("company_reviews")
                .subtitle("Xuất ngày: " + generatedAt + buildFilterDesc(cmd))
                .columns(COLUMNS)
                .data(data)
                .build();
    }

    private String buildFilterDesc(Command cmd) {
        if (cmd.status() != null)
            return " | Trạng thái: " + cmd.status().name();
        return "";
    }
}