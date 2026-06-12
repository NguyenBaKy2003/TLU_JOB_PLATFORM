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
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminExportCandidateSubscriptionsUseCase {

        private final AdminCandidateSubscriptionUseCase adminCandidateSubscriptionUseCase;
        private final ExcelExportService excelExportService;
        private final PdfExportService pdfExportService;
        private final CandidateProfileRepository candidateProfileRepository;

        public record SubWithCandidate(CandidateSubscription sub, String candidateName) {
        }

        private static final List<ExportColumn<SubWithCandidate>> COLUMNS = List.of(
                        ExportColumn.of("Họ tên ứng viên",
                                        SubWithCandidate::candidateName, 30),
                        ExportColumn.of("Candidate ID",
                                        r -> r.sub().getCandidateId() != null ? r.sub().getCandidateId().toString()
                                                        : "",
                                        36),
                        ExportColumn.of("Gói",
                                        r -> r.sub().getPlanCode(), 16),
                        ExportColumn.of("Loại",
                                        r -> r.sub().isYearly() ? "Năm" : "Tháng", 10),
                        ExportColumn.of("Trạng thái",
                                        r -> r.sub().getStatus() != null ? r.sub().getStatus().name() : "", 14),
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
                        ExportColumn.of("AI Writer",
                                        r -> r.sub().isAiCvWriter() ? "Có" : "Không", 10),
                        ExportColumn.of("Template Premium",
                                        r -> r.sub().isPremiumTemplateAccess() ? "Có" : "Không", 14),
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
                log.info("Export candidate subscriptions — format={}", format);

                List<SubWithCandidate> data = adminCandidateSubscriptionUseCase.listAllForExport().stream()
                                .map(sub -> {
                                        String name = candidateProfileRepository.findByUserId(sub.getCandidateId())
                                                        .map(p -> (p.getFirstName() + " " + p.getLastName()).trim())
                                                        .orElse("Không xác định");
                                        return new SubWithCandidate(sub, name);
                                })
                                .toList();

                String generatedAt = LocalDateTime.now()
                                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

                ExportRequest<SubWithCandidate> req = ExportRequest.<SubWithCandidate>builder()
                                .title("Danh sách đăng ký Candidate")
                                .filename("candidate_subscriptions")
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