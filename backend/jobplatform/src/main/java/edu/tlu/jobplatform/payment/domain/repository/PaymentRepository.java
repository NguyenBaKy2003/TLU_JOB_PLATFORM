package edu.tlu.jobplatform.payment.domain.repository;

import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository {

        // ── Common ───────────────────────────────────────────────────────────────

        Optional<Payment> findById(UUID id);

        Optional<Payment> findByGatewayOrderCode(String orderCode);

        Payment save(Payment payment);

        // ── Company ──────────────────────────────────────────────────────────────

        Optional<Payment> findPendingByCompanyId(UUID companyId);

        Page<Payment> findByCompanyId(UUID companyId, Pageable pageable);

        Page<Payment> findByCompanyIdAndStatus(UUID companyId, PaymentStatus status, Pageable pageable);

        // ── Candidate ────────────────────────────────────────────────────────────

        Optional<Payment> findPendingByCandidateId(UUID candidateId);

        Page<Payment> findByCandidateId(UUID candidateId, Pageable pageable);

        Page<Payment> findByCandidateIdAndStatus(UUID candidateId, PaymentStatus status, Pageable pageable);

        // ── Admin search ──────────────────────────────────────────────────────────

        /**
         * Search đa điều kiện — tham số null = bỏ qua.
         * companyId và candidateId loại trừ nhau.
         */
        Page<Payment> search(
                        UUID companyId,
                        UUID candidateId,
                        PaymentStatus status,
                        String gateway,
                        LocalDateTime fromDate,
                        LocalDateTime toDate,
                        Pageable pageable);

        Page<Payment> searchByCompanyId(
                        UUID companyId,
                        PaymentStatus status,
                        String gateway,
                        String keyword,
                        LocalDateTime fromDate,
                        LocalDateTime toDate,
                        Pageable pageable);

        Page<Payment> searchByCandidateId(
                        UUID candidateId,
                        PaymentStatus status,
                        String gateway,
                        String keyword,
                        LocalDateTime fromDate,
                        LocalDateTime toDate,
                        Pageable pageable);

        // ── Stats ─────────────────────────────────────────────────────────────────

        /** Tổng doanh thu SUCCESS trong khoảng thời gian */
        BigDecimal sumSuccessAmount(LocalDateTime from, LocalDateTime to);

        /** Đếm tất cả giao dịch trong khoảng thời gian */
        long countByPeriod(LocalDateTime from, LocalDateTime to);

        /** Đếm theo status trong khoảng thời gian */
        long countByStatusAndPeriod(PaymentStatus status, LocalDateTime from, LocalDateTime to);

        /** Đếm theo status — dùng cho dashboard tổng */
        long countByStatus(PaymentStatus status);
}