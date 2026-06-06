package edu.tlu.jobplatform.admin.application.usecase.export;

import edu.tlu.jobplatform.admin.application.usecase.AdminApplicationUseCase;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.presentation.dto.response.ApplicationResponse;
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
public class AdminExportApplicationsUseCase {

    private final AdminApplicationUseCase adminApplicationUseCase;
    private final ExcelExportService excelExportService;
    private final PdfExportService pdfExportService;

    // ── Column definitions ────────────────────────────────────────────────────

    private static final List<ExportColumn<ApplicationResponse>> COLUMNS = List.of(
            ExportColumn.of("ID",
                    r -> r.getId() != null ? r.getId().toString() : "", 36),
            ExportColumn.of("Ứng viên",
                    r -> r.getCandidate() != null ? r.getCandidate().getFullName() : "", 24),
            ExportColumn.of("Email ứng viên",
                    r -> r.getCandidate() != null ? r.getCandidate().getEmail() : "", 28),
            ExportColumn.of("SĐT",
                    r -> r.getCandidate() != null && r.getCandidate().getPhone() != null
                            ? r.getCandidate().getPhone()
                            : "",
                    16),
            ExportColumn.of("Vị trí",
                    r -> r.getJob() != null ? r.getJob().getTitle() : "", 28),
            ExportColumn.of("Cấp bậc",
                    r -> r.getJob() != null && r.getJob().getLevel() != null
                            ? r.getJob().getLevel()
                            : "",
                    14),
            ExportColumn.of("Địa điểm",
                    r -> r.getJob() != null && r.getJob().getWorkLocationCity() != null
                            ? r.getJob().getWorkLocationCity()
                            : "",
                    16),
            ExportColumn.of("Công ty",
                    r -> r.getCompany() != null ? r.getCompany().getName() : "", 24),
            ExportColumn.of("Ngành",
                    r -> r.getCompany() != null && r.getCompany().getIndustry() != null
                            ? r.getCompany().getIndustry()
                            : "",
                    18),
            ExportColumn.of("Trạng thái",
                    r -> r.getStatus() != null ? r.getStatus().name() : "", 18),
            ExportColumn.of("Điểm AI",
                    r -> r.getAiScore() != null ? String.valueOf(r.getAiScore()) : "Chưa tính", 12),
            ExportColumn.of("Nhãn AI",
                    r -> r.getAiScoreLabel() != null ? r.getAiScoreLabel() : "", 14),
            ExportColumn.of("Ngày nộp",
                    r -> r.getAppliedAt() != null
                            ? r.getAppliedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                            : "",
                    18),
            ExportColumn.of("Phỏng vấn lúc",
                    r -> r.getInterviewScheduledAt() != null
                            ? r.getInterviewScheduledAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                            : "",
                    18));

    // ── Command / Format ──────────────────────────────────────────────────────

    public record Command(ApplicationStatus status, String keyword) {
    }

    public enum Format {
        EXCEL, PDF
    }

    // ── Execute ───────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ExportResult execute(Command cmd, Format format) {
        log.info("Export applications — format={}, status={}, keyword={}",
                format, cmd.status(), cmd.keyword());

        List<ApplicationResponse> data = fetchAll(cmd);
        ExportRequest<ApplicationResponse> req = buildRequest(cmd, data);

        return switch (format) {
            case EXCEL -> excelExportService.export(req);
            case PDF -> pdfExportService.export(req);
        };
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private List<ApplicationResponse> fetchAll(Command cmd) {
        var pageable = PageRequest.of(0, Integer.MAX_VALUE,
                Sort.by("appliedAt").descending());
        return adminApplicationUseCase
                .listAll(cmd.status(), cmd.keyword(), pageable)
                .map(adminApplicationUseCase::buildFullResponse)
                .getContent();
    }

    private ExportRequest<ApplicationResponse> buildRequest(Command cmd,
            List<ApplicationResponse> data) {
        String generatedAt = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        return ExportRequest.<ApplicationResponse>builder()
                .title("Danh sách đơn ứng tuyển")
                .filename("applications")
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
        return sb.toString();
    }
}