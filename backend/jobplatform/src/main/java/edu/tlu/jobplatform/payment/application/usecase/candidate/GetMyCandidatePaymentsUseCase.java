package edu.tlu.jobplatform.payment.application.usecase.candidate;

import edu.tlu.jobplatform.payment.domain.model.Payment;
import edu.tlu.jobplatform.payment.domain.model.PaymentStatus;
import edu.tlu.jobplatform.payment.domain.repository.PaymentRepository;
import edu.tlu.jobplatform.payment.presentation.dto.response.PaymentResponse;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.shared.security.SecurityUtils;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscriptionPlan;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Candidate xem lịch sử thanh toán của chính mình.
 * candidateId lấy từ JWT — không thể xem của người khác.
 *
 * listMyPayments → trả Page<Payment> (không cần plan, dùng cho danh sách)
 * getMyPaymentDetail → trả PaymentResponse kèm SubscriptionSummary
 */
@Service
@RequiredArgsConstructor
public class GetMyCandidatePaymentsUseCase {

    private final PaymentRepository paymentRepo;
    private final CandidateSubscriptionPlanRepository planRepository;

    @Transactional(readOnly = true)
    public Page<PaymentResponse> listMyPayments(
            PaymentStatus status,
            String gateway,
            String keyword,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable) {

        UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();
        return paymentRepo
                .searchByCandidateId(candidateId, status, gateway, keyword, fromDate, toDate, pageable)
                .map(PaymentResponse::from);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getMyPaymentDetail(UUID paymentId) {
        UUID candidateId = SecurityUtils.getCurrentUserIdOrThrow();

        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Payment", paymentId));

        // Bảo vệ: chỉ xem được payment của chính mình
        if (!candidateId.equals(payment.getCandidateId()))
            throw new BusinessRuleException(
                    "Bạn không có quyền xem giao dịch này.", "FORBIDDEN");

        // Load plan để nhúng SubscriptionSummary
        CandidateSubscriptionPlan plan = planRepository
                .findByCode(payment.getPlanCode())
                .orElse(null);

        return PaymentResponse.from(payment, plan);
    }
}