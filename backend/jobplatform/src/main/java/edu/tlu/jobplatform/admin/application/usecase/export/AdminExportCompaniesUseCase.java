package edu.tlu.jobplatform.admin.application.usecase.export;

import edu.tlu.jobplatform.admin.application.usecase.AdminCompanyUseCase;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.model.VerificationStatus;
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
public class AdminExportCompaniesUseCase {

    private final AdminCompanyUseCase adminCompanyUseCase;
    private final ExcelExportService excelExportService;
    private final PdfExportService pdfExportService;

    // ── Column definitions ───

    private static final List<ExportColumn<CompanyProfile>> COLUMNS = List.of(
            ExportColumn.of("Tên công ty", CompanyProfile::getName, 28),
            ExportColumn.of("Email", CompanyProfile::getEmail, 26),
            ExportColumn.of("Thành phố", CompanyProfile::getCity, 16),
            ExportColumn.of("Ngành", CompanyProfile::getIndustry, 18),
            ExportColumn.of("Quy mô",
                    c -> c.getSize() != null ? c.getSize().name() : "", 14),
            ExportColumn.of("Xác thực",
                    c -> c.getVerificationStatus() != null
                            ? c.getVerificationStatus().name()
                            : "",
                    16),
            ExportColumn.of("Hoạt động",
                    c -> c.isActive() ? "Có" : "Không", 10),
            ExportColumn.of("Ngày tạo",
                    c -> c.getCreatedAt() != null
                            ? c.getCreatedAt().format(
                                    DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                            : "",
                    14));

    // ── Commands ─────────────

    public record Command(
            VerificationStatus status,
            String keyword,
            String city,
            String size,
            String planCode,
            Double minRating) {
    }

    public enum Format {
        EXCEL, PDF
    }

    // ── Execute ──────────────
    private List<CompanyProfile> fetchAll(Command cmd) {
        var pageable = PageRequest.of(0, Integer.MAX_VALUE, Sort.unsorted());
        return adminCompanyUseCase
                .adminSearch(cmd.status(), cmd.keyword(), cmd.city(),
                        cmd.size(), cmd.planCode(), cmd.minRating(), pageable)
                .getContent();
    }

    @Transactional(readOnly = true)
    public ExportResult execute(Command cmd, Format format) {
        log.info("Export companies — format={}, status={}, keyword={}",
                format, cmd.status(), cmd.keyword());

        List<CompanyProfile> data = fetchAll(cmd);
        ExportRequest<CompanyProfile> req = buildRequest(cmd, data);

        return switch (format) {
            case EXCEL -> excelExportService.export(req);
            case PDF -> pdfExportService.export(req);
        };
    }

    // ── Private helpers ──────

    private ExportRequest<CompanyProfile> buildRequest(Command cmd, List<CompanyProfile> data) {
        String generatedAt = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

        return ExportRequest.<CompanyProfile>builder()
                .title("Danh sách công ty")
                .filename("companies")
                .subtitle("Xuất ngày: " + generatedAt + buildFilterDesc(cmd))
                .columns(COLUMNS)
                .data(data)
                .build();
    }

    private String buildFilterDesc(Command cmd) {
        StringBuilder sb = new StringBuilder();
        if (cmd.status() != null)
            sb.append(" | Trạng thái: ").append(cmd.status().name());
        if (cmd.keyword() != null && !cmd.keyword().isBlank())
            sb.append(" | Từ khóa: ").append(cmd.keyword());
        if (cmd.city() != null)
            sb.append(" | Thành phố: ").append(cmd.city());
        if (cmd.size() != null)
            sb.append(" | Quy mô: ").append(cmd.size());
        if (cmd.planCode() != null)
            sb.append(" | Plan: ").append(cmd.planCode());
        if (cmd.minRating() != null)
            sb.append(" | Rating ≥ ").append(cmd.minRating());
        return sb.toString();
    }
}