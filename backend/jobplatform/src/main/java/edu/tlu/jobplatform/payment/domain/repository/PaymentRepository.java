package edu.tlu.jobplatform.payment.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Bản THAY THẾ PaymentRepository — giữ methods cũ, thêm mới cho employer/admin.
 *
 * Lưu ý: Payment nằm trong subscription domain,
 * không tách thành domain riêng.
 */
public interface PaymentRepository {

    // ── Existing methods (giữ nguyên) ─

    Optional<Payment> findById(UUID id);

    Optional<Payment> findByGatewayOrderCode(String orderCode);

    Optional<Payment> findPendingByCompanyId(UUID companyId);

    Payment save(Payment payment);

    // ── Employer: lịch sử thanh toán của công ty mình ─

    /** Tất cả payments của 1 công ty, mới nhất trước */
    Page<Payment> findByCompanyId(UUID companyId, Pageable pageable);

    /** Filter thêm theo status */
    Page<Payment> findByCompanyIdAndStatus(UUID companyId, PaymentStatus status, Pageable pageable);

    // ── Admin: xem toàn hệ thống

    /**
     * Search đa điều kiện — tham số null = bỏ qua điều kiện đó.
     */
    Page<Payment> search(
            UUID companyId,
            PaymentStatus status,
            String gateway,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable);

    /** Tổng doanh thu SUCCESS trong khoảng thời gian */
    BigDecimal sumSuccessAmount(LocalDateTime from, LocalDateTime to);

    /** Đếm theo status — dùng cho dashboard */
    long countByStatus(PaymentStatus status);
}
