package edu.tlu.jobplatform.admin.application.usecase.export;

import edu.tlu.jobplatform.admin.application.usecase.AdminUserUseCase;
import edu.tlu.jobplatform.admin.presentation.dto.response.AdminUserResponse;
import edu.tlu.jobplatform.shared.export.ExcelExportService;
import edu.tlu.jobplatform.shared.export.ExportColumn;
import edu.tlu.jobplatform.shared.export.ExportRequest;
import edu.tlu.jobplatform.shared.export.ExportResult;
import edu.tlu.jobplatform.shared.export.PdfExportService;
import edu.tlu.jobplatform.user.domain.model.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Use case xuất danh sách User ra Excel / PDF.
 *
 * Command chứa toàn bộ filter — không phân trang vì export lấy hết.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminExportUsersUseCase {

        private final AdminUserUseCase adminUserUseCase;
        private final ExcelExportService excelExportService;
        private final PdfExportService pdfExportService;

        // ── Column definitions — dùng chung Excel & PDF ───────────────────────────

        private static final List<ExportColumn<AdminUserResponse>> COLUMNS = List.of(
                        ExportColumn.of("Họ tên",
                                        AdminUserResponse::getFullName, 22),
                        ExportColumn.of("Email",
                                        AdminUserResponse::getEmail, 28),
                        ExportColumn.of("Vai trò",
                                        r -> r.getRole().name(), 14),
                        ExportColumn.of("Trạng thái",
                                        r -> r.isActive() ? "Hoạt động" : "Khóa", 13),
                        ExportColumn.of("Ngày tạo",
                                        r -> r.getCreatedAt() != null
                                                        ? r.getCreatedAt().format(
                                                                        DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                                                        : "",
                                        14),
                        ExportColumn.of("Lần cuối đăng nhập",
                                        r -> r.getLastLoginAt() != null
                                                        ? r.getLastLoginAt().format(
                                                                        DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                                                        : "Chưa đăng nhập",
                                        20));

        // ── Commands / Result ─────────────────────────────────────────────────────

        public record Command(
                        String keyword,
                        UserRole role,
                        Boolean active) {
        }

        public enum Format {
                EXCEL, PDF
        }

        // ── Execute ───────────────────────────────────────────────────────────────

        @Transactional(readOnly = true)
        public ExportResult execute(Command cmd, Format format) {
                log.info("Export users — format={}, keyword={}, role={}, active={}",
                                format, cmd.keyword(), cmd.role(), cmd.active());

                List<AdminUserResponse> data = fetchAll(cmd);
                ExportRequest<AdminUserResponse> req = buildRequest(cmd, data);

                return switch (format) {
                        case EXCEL -> excelExportService.export(req);
                        case PDF -> pdfExportService.export(req);
                };
        }

        // ── Private helpers ───────────────────────────────────────────────────────

        private List<AdminUserResponse> fetchAll(Command cmd) {
                var pageable = PageRequest.of(0, Integer.MAX_VALUE,
                                Sort.by("createdAt").descending());
                return adminUserUseCase
                                .listUsers(cmd.keyword(), cmd.role(), cmd.active(), pageable)
                                .map(AdminUserResponse::from)
                                .getContent();
        }

        private ExportRequest<AdminUserResponse> buildRequest(Command cmd,
                        List<AdminUserResponse> data) {
                String generatedAt = LocalDateTime.now()
                                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

                return ExportRequest.<AdminUserResponse>builder()
                                .title("Danh sách người dùng")
                                .filename("users")
                                .subtitle("Xuất ngày: " + generatedAt + buildFilterDesc(cmd))
                                .columns(COLUMNS)
                                .data(data)
                                .build();
        }

        private String buildFilterDesc(Command cmd) {
                StringBuilder sb = new StringBuilder();
                if (cmd.keyword() != null && !cmd.keyword().isBlank())
                        sb.append(" | Từ khóa: ").append(cmd.keyword());
                if (cmd.role() != null)
                        sb.append(" | Vai trò: ").append(cmd.role().name());
                if (cmd.active() != null)
                        sb.append(" | Trạng thái: ").append(cmd.active() ? "Hoạt động" : "Khóa");
                return sb.toString();
        }
}