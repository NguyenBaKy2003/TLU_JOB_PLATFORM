package edu.tlu.jobplatform.admin.application.usecase.export;

import edu.tlu.jobplatform.admin.application.usecase.AdminSubscriptionUseCase;
import edu.tlu.jobplatform.company.domain.model.CompanyProfile;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
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
        private final CompanyRepository companyProfileRepository;

        public record SubWithCompany(CompanySubscription sub, String companyName) {
        }

        private static final List<ExportColumn<SubWithCompany>> COLUMNS = List.of(
                        ExportColumn.of("Tên công ty",
                                        SubWithCompany::companyName, 30),
                        ExportColumn.of("Company ID",
                                        r -> r.sub().getCompanyId() != null ? r.sub().getCompanyId().toString() : "",
                                        36),
                        ExportColumn.of("Gói",
                                        r -> r.sub().getPlanCode(), 16),
                        ExportColumn.of("Loại",
                                        r -> r.sub().isYearly() ? "Năm" : "Tháng", 10),
                        ExportColumn.of("Trạng thái",
                                        r -> r.sub().getStatus() != null ? r.sub().getStatus().name() : "", 14),
                        ExportColumn.of("Tin đăng (còn)",
                                        r -> r.sub().getJobPostQuota() != null
                                                        ? String.valueOf(r.sub().getJobPostQuota().getLimit())
                                                        : "",
                                        14),
                        ExportColumn.of("AI Features",
                                        r -> r.sub().isAiFeatures() ? "Có" : "Không", 10),
                        ExportColumn.of("Analytics",
                                        r -> r.sub().isAnalyticsAccess() ? "Có" : "Không", 10),
                        ExportColumn.of("Bắt đầu",
                                        r -> r.sub().getStartedAt() != null
                                                        ? r.sub().getStartedAt().format(
                                                                        DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                                                        : "",
                                        14),
                        ExportColumn.of("Hết hạn",
                                        r -> r.sub().getExpiresAt() != null
                                                        ? r.sub().getExpiresAt().format(
                                                                        DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                                                        : "",
                                        14),
                        ExportColumn.of("Còn lại (ngày)",
                                        r -> r.sub().isActive() ? String.valueOf(r.sub().daysRemaining()) : "0", 14),
                        ExportColumn.of("Ngày tạo",
                                        r -> r.sub().getCreatedAt() != null
                                                        ? r.sub().getCreatedAt().format(
                                                                        DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                                                        : "",
                                        14));

        public enum Format {
                EXCEL, PDF
        }

        @Transactional(readOnly = true)
        public ExportResult execute(Format format) {
                log.info("Export company subscriptions — format={}", format);

                List<SubWithCompany> data = adminSubscriptionUseCase.listAllForExport().stream()
                                .map(sub -> {
                                        String name = companyProfileRepository.findById(sub.getCompanyId())
                                                        .map(CompanyProfile::getName)
                                                        .orElse("Không xác định");
                                        return new SubWithCompany(sub, name);
                                })
                                .toList();

                String generatedAt = LocalDateTime.now()
                                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

                ExportRequest<SubWithCompany> req = ExportRequest.<SubWithCompany>builder()
                                .title("Danh sách đăng ký Employer")
                                .filename("company_subscriptions")
                                .subtitle("Xuất ngày: " + generatedAt)
                                .columns(COLUMNS)
                                .data(data)
                                .build();

                return switch (format) {
                        case EXCEL -> excelExportService.export(req);
                        case PDF -> pdfExportService.export(req);
                };
        }
}