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
        }

        subscriptionRepository.save(sub);
        log.info("[CandidateQuota] Consumed: candidateId={} type={}", candidateId, type);
    }

    @Transactional
    public void refund(UUID candidateId, QuotaType type) {
        subscriptionRepository.findActiveByCandidate(candidateId).ifPresent(sub -> {
            switch (type) {
                case APPLICATION -> sub.refundApplication();
                default -> throw new BusinessRuleException(
                        "Không hỗ trợ hoàn quota loại: " + type, "UNSUPPORTED_QUOTA_REFUND");
            }
            subscriptionRepository.save(sub);
            log.info("[CandidateQuota] Refunded: candidateId={} type={}", candidateId, type);
        });
    }

    public enum QuotaType {
        APPLICATION,
        CV_BOOST
    }
}