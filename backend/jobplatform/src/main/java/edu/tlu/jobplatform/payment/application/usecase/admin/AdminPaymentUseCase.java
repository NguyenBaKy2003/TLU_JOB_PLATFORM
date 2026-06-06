package edu.tlu.jobplatform.payment.application.usecase.admin;

import edu.tlu.jobplatform.company.domain.repository.CompanyRepository;
import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import edu.tlu.jobplatform.payment.domain.repository.PaymentRepository;
import edu.tlu.jobplatform.payment.presentation.dto.response.AdminPaymentResponse;
import edu.tlu.jobplatform.user.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminPaymentUseCase {

        private final PaymentRepository paymentRepo;
        private final CompanyRepository companyRepo;
        private final UserRepository userRepo;

        // ── Stats record ──────────────────────────────────────────────────────────

        public record Stats(
                        BigDecimal totalRevenue,
                        long totalCount,
                        long pendingCount,
                        long successCount,
                        long failedCount,
                        long refundedCount,
                        LocalDateTime from,
                        LocalDateTime to) {
        }

        // ── Search ────────────────────────────────────────────────────────────────

        @Transactional(readOnly = true)
        public Page<AdminPaymentResponse> search(
                        UUID companyId,
                        UUID candidateId,
                        PaymentStatus status,
                        String gateway,
                        LocalDateTime fromDate,
                        LocalDateTime toDate,
                        Pageable pageable) {

                return paymentRepo
                                .search(companyId, candidateId, status, gateway, fromDate, toDate, pageable)
                                .map(this::enrich);
        }

        // ── Get by Company ────────────────────────────────────────────────────────

        @Transactional(readOnly = true)
        public Page<AdminPaymentResponse> getByCompany(
                        UUID companyId,
                        PaymentStatus status,
                        Pageable pageable) {

                if (status != null) {
                        return paymentRepo
                                        .findByCompanyIdAndStatus(companyId, status, pageable)
                                        .map(this::enrich);
                }
                return paymentRepo
                                .findByCompanyId(companyId, pageable)
                                .map(this::enrich);
        }

        // ── Get by Candidate ──────────────────────────────────────────────────────

        @Transactional(readOnly = true)
        public Page<AdminPaymentResponse> getByCandidate(
                        UUID candidateId,
                        PaymentStatus status,
                        Pageable pageable) {

                if (status != null) {
                        return paymentRepo
                                        .findByCandidateIdAndStatus(candidateId, status, pageable)
                                        .map(this::enrich);
                }
                return paymentRepo
                                .findByCandidateId(candidateId, pageable)
                                .map(this::enrich);
        }

        // ── Stats ─────────────────────────────────────────────────────────────────

        @Transactional(readOnly = true)
        public Stats getStats(LocalDateTime from, LocalDateTime to) {
                BigDecimal totalRevenue = paymentRepo.sumSuccessAmount(from, to);
                long totalCount = paymentRepo.countByPeriod(from, to);
                long pendingCount = paymentRepo.countByStatusAndPeriod(PaymentStatus.PENDING, from, to);
                long successCount = paymentRepo.countByStatusAndPeriod(PaymentStatus.SUCCESS, from, to);
                long failedCount = paymentRepo.countByStatusAndPeriod(PaymentStatus.FAILED, from, to);
                long refundedCount = paymentRepo.countByStatusAndPeriod(PaymentStatus.REFUNDED, from, to);

                return new Stats(
                                totalRevenue != null ? totalRevenue : BigDecimal.ZERO,
                                totalCount,
                                pendingCount,
                                successCount,
                                failedCount,
                                refundedCount,
                                from,
                                to);
        }

        // ── Get by ID ─────────────────────────────────────────────────────────────

        @Transactional(readOnly = true)
        public Payment getById(UUID id) {
                return paymentRepo.findById(id)
                                .orElseThrow(() -> new RuntimeException("Payment not found: " + id));
        }

        @Transactional(readOnly = true)
        public AdminPaymentResponse getEnrichedById(UUID id) {
                return enrich(getById(id));
        }

        // ── Refund ────────────────────────────────────────────────────────────────

        @Transactional
        public AdminPaymentResponse refund(UUID id, String reason) {
                Payment payment = getById(id);
                if (payment.getStatus() != PaymentStatus.SUCCESS) {
                        throw new IllegalStateException("Chỉ có thể hoàn tiền giao dịch thành công");
                }
                payment.markRefunded(reason);
                paymentRepo.save(payment);
                log.info("Payment refunded: id={}, reason={}", id, reason);
                return enrich(payment);
        }

        // ── Enrich ────────────────────────────────────────────────────────────────

        public AdminPaymentResponse enrich(Payment payment) {
                return AdminPaymentResponse.from(payment,
                                resolveCompanyName(payment),
                                resolveCandidateName(payment));
        }

        // ── Helpers ───────────────────────────────────────────────────────────────

        private String resolveCompanyName(Payment payment) {
                if (payment.getCompanyId() == null)
                        return null;
                return companyRepo.findById(payment.getCompanyId())
                                .map(c -> c.getName())
                                .orElse("Công ty không xác định");
        }

        private String resolveCandidateName(Payment payment) {
                if (payment.getCandidateId() == null)
                        return null;
                return userRepo.findById(payment.getCandidateId())
                                .map(u -> u.getFullName() + " (" + u.getEmail() + ")")
                                .orElse("Ứng viên không xác định");
        }
}