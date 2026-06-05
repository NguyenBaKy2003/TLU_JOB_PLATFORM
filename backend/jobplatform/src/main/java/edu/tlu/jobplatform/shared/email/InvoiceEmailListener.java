package edu.tlu.jobplatform.shared.email;

import edu.tlu.jobplatform.admin.application.usecase.export.AdminExportInvoiceUseCase;
import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.payment.domain.repository.PaymentRepository;
import edu.tlu.jobplatform.shared.event.subscription.CandidateSubscriptionActivatedEvent;
import edu.tlu.jobplatform.shared.event.subscription.SubscriptionActivatedEvent;
import edu.tlu.jobplatform.shared.export.ExportResult;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
@RequiredArgsConstructor
public class InvoiceEmailListener {

    private final AdminExportInvoiceUseCase exportInvoiceUseCase;
    private final EmailService emailService;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    @Value("${app.frontend-url:https://jobplatform.vn}")
    private String frontendUrl;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

    /**
     * Company — chạy sau khi transaction COMMIT xong để đảm bảo
     * Payment.status = SUCCESS khi tạo PDF.
     */
    @Async("aiTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCompanySubscriptionActivated(SubscriptionActivatedEvent event) {
        try {
            var payment = paymentRepository.findById(event.getPaymentId()).orElseThrow();
            ExportResult pdf = exportInvoiceUseCase.execute(event.getPaymentId());

            String email = event.getCompanyEmail();
            String name = "Quý khách";

            if (email == null || email.isBlank()) {
                var company = companyRepository.findById(event.getCompanyId()).orElse(null);
                if (company == null) {
                    log.warn("[InvoiceListener] Company not found: {}", event.getCompanyId());
                    return;
                }
                email = company.getEmail();
                name = company.getName();
            }

            emailService.sendInvoiceEmail(
                    email, name,
                    event.getPlanName(),
                    formatAmount(payment.getAmount(), payment.getCurrency()),
                    payment.getGateway(),
                    payment.getGatewayTransactionId(),
                    payment.getCompletedAt() != null
                            ? payment.getCompletedAt().format(FMT)
                            : payment.getCreatedAt().format(FMT),
                    frontendUrl + "/employer/dashboard",
                    pdf.getBytes(),
                    pdf.getFilename());

        } catch (Exception e) {
            log.error("[InvoiceListener] Company invoice email failed: {}", e.getMessage(), e);
        }
    }

    /**
     * Candidate — tương tự, AFTER_COMMIT để tránh đọc status PENDING.
     */
    @Async("aiTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCandidateSubscriptionActivated(CandidateSubscriptionActivatedEvent event) {
        try {
            var payment = paymentRepository.findById(event.getPaymentId()).orElseThrow();
            ExportResult pdf = exportInvoiceUseCase.execute(event.getPaymentId());

            userRepository.findById(event.getCandidateId()).ifPresentOrElse(
                    user -> emailService.sendInvoiceEmail(
                            user.getEmail(),
                            user.getFullName(),
                            event.getPlanName(),
                            formatAmount(payment.getAmount(), payment.getCurrency()),
                            payment.getGateway(),
                            payment.getGatewayTransactionId(),
                            payment.getCompletedAt() != null
                                    ? payment.getCompletedAt().format(FMT)
                                    : payment.getCreatedAt().format(FMT),
                            frontendUrl + "/candidate/profile",
                            pdf.getBytes(),
                            pdf.getFilename()),
                    () -> log.warn("[InvoiceListener] User not found: {}", event.getCandidateId()));

        } catch (Exception e) {
            log.error("[InvoiceListener] Candidate invoice email failed: {}", e.getMessage(), e);
        }
    }

    private String formatAmount(BigDecimal amount, String currency) {
        if (amount == null)
            return "0 VND";
        if ("USD".equalsIgnoreCase(currency))
            return String.format("$%,.2f", amount.doubleValue() / 100);
        return String.format("%,.0f VND", amount);
    }
}