package edu.tlu.jobplatform.admin.application.usecase.export;

import edu.tlu.jobplatform.admin.application.usecase.AdminJobUseCase;
import edu.tlu.jobplatform.job.domain.model.JobPost;
import edu.tlu.jobplatform.job.domain.model.vo.JobStatus;
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
public class AdminExportJobsUseCase {

    private final AdminJobUseCase adminJobUseCase;
    private final ExcelExportService excelExportService;
    private final PdfExportService pdfExportService;

    private static final List<ExportColumn<JobPost>> COLUMNS = List.of(
            ExportColumn.of("Tiêu đề", JobPost::getTitle, 30),
            ExportColumn.of("Công ty", j -> j.getCompanyId() != null ? j.getCompanyId().toString() : "", 28),
            ExportColumn.of("Trạng thái", j -> j.getStatus() != null ? j.getStatus().name() : "", 14),
            ExportColumn.of("Cấp bậc", j -> j.getLevel() != null ? j.getLevel() : "", 14),
            ExportColumn.of("Địa điểm", j -> j.getWorkLocation() != null ? j.getWorkLocation() : "", 18),
            ExportColumn.of("Danh mục", j -> j.getCategory() != null ? j.getCategory() : "", 16),
            ExportColumn.of("Hạn nộp",
                    j -> j.getDeadline() != null
                            ? j.getDeadline().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                            : "",
                    14),
            ExportColumn.of("Ngày tạo",
                    j -> j.getCreatedAt() != null
                            ? j.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                            : "",
                    14));

    public record Command(String keyword, JobStatus status, String city, String category) {
    }

    public enum Format {
        EXCEL, PDF
    }

    @Transactional(readOnly = true)
    public ExportResult execute(Command cmd, Format format) {
        log.info("Export jobs — format={}, status={}, keyword={}", format, cmd.status(), cmd.keyword());
        List<JobPost> data = fetchAll(cmd);
        ExportRequest<JobPost> req = buildRequest(cmd, data);
        return switch (format) {
            case EXCEL -> excelExportService.export(req);
            case PDF -> pdfExportService.export(req);
        };
    }

    private List<JobPost> fetchAll(Command cmd) {
        var pageable = PageRequest.of(0, Integer.MAX_VALUE, Sort.by("createdAt").descending());
        return adminJobUseCase
                .adminSearch(cmd.keyword(), cmd.status(), cmd.city(), cmd.category(), pageable)
                .getContent();
    }

    private ExportRequest<JobPost> buildRequest(Command cmd, List<JobPost> data) {
        String generatedAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        return ExportRequest.<JobPost>builder()
                .title("Danh sách tin tuyển dụng")
                .filename("jobs")
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
        if (cmd.category() != null)
            sb.append(" | Danh mục: ").append(cmd.category());
        return sb.toString();
    }
}