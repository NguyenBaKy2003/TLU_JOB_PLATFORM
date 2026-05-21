package edu.tlu.jobplatform.subscription.application.usecase;

import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.subscription.domain.model.CandidateSubscription;
import edu.tlu.jobplatform.subscription.domain.repository.CandidateSubscriptionRepository;
import edu.tlu.jobplatform.subscription.domain.service.CandidateQuotaDomainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * UseCase: Trừ quota khi Candidate thực hiện hành động.
 *
 * Được gọi từ các UseCase khác trong hệ thống:
 * - JobApplicationUseCase → consumeApplication()
 * - CvBoostUseCase → consumeCvBoost()
 * - JobAlertUseCase → consumeJobAlert() / releaseJobAlert()
 * - MockInterviewUseCase → consumeMockInterview()
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConsumeCandidateQuotaUseCase {

    private final CandidateSubscriptionRepository subscriptionRepository;
    private final CandidateQuotaDomainService quotaDomainService;

    @Transactional
    public void execute(UUID candidateId, QuotaType type) {
        CandidateSubscription sub = subscriptionRepository
                .findActiveByCandidate(candidateId)
                .orElseThrow(() -> new BusinessRuleException(
                        "Không tìm thấy gói dịch vụ active.", "NO_ACTIVE_CANDIDATE_SUBSCRIPTION"));

        switch (type) {
            case APPLICATION -> quotaDomainService.consumeApplication(sub);
            case CV_BOOST -> quotaDomainService.consumeCvBoost(sub);
            case JOB_ALERT -> quotaDomainService.consumeJobAlert(sub);
            case MOCK_INTERVIEW -> quotaDomainService.consumeMockInterview(sub);
        }

        subscriptionRepository.save(sub);
        log.info("[CandidateQuota] Consumed [candidateId={}, type={}]", candidateId, type);
    }

    /** Hoàn lại quota khi candidate xoá job alert hoặc rút đơn ứng tuyển */
    @Transactional
    public void refund(UUID candidateId, QuotaType type) {
        subscriptionRepository.findActiveByCandidate(candidateId).ifPresent(sub -> {
            switch (type) {
                case APPLICATION -> sub.refundApplication();
                case JOB_ALERT -> sub.releaseJobAlert();
                default -> throw new BusinessRuleException(
                        "Không hỗ trợ hoàn quota loại: " + type, "UNSUPPORTED_QUOTA_REFUND");
            }
            subscriptionRepository.save(sub);
            log.info("[CandidateQuota] Refunded [candidateId={}, type={}]", candidateId, type);
        });
    }

    public enum QuotaType {
        APPLICATION,
        CV_BOOST,
        JOB_ALERT,
        MOCK_INTERVIEW
    }
}