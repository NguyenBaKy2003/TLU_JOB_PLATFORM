package edu.tlu.jobplatform.candidate.application.usecase.profile;

import edu.tlu.jobplatform.candidate.domain.model.CandidateProfile;
import edu.tlu.jobplatform.candidate.domain.repository.CandidateProfileRepository;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.subscription.application.usecase.ConsumeCandidateQuotaUseCase;
import edu.tlu.jobplatform.subscription.application.usecase.CheckCandidateQuotaUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoostCvUseCase {

        private static final int BOOST_DAYS = 7;

        private final CandidateProfileRepository profileRepository;
        private final ConsumeCandidateQuotaUseCase consumeQuotaUseCase;
        private final CheckCandidateQuotaUseCase checkQuotaUseCase;

        @Transactional
        public Result execute(UUID candidateId) {

                CandidateProfile profile = profileRepository.findByUserId(candidateId)
                                .orElseThrow(() -> ResourceNotFoundException.of("CandidateProfile", candidateId));

                if (profile.isBoosted()) {
                        throw new edu.tlu.jobplatform.shared.exception.BusinessRuleException(
                                        String.format(
                                                        "Hồ sơ của bạn đang được boost đến %s. Bạn chỉ có thể boost lại sau khi hết hạn.",
                                                        profile.getBoostedUntil().toLocalDate()),
                                        "CV_BOOST_STILL_ACTIVE");
                }

                CheckCandidateQuotaUseCase.Result quota = checkQuotaUseCase.execute(candidateId);

                if (!quota.hasActiveSubscription()) {
                        throw new edu.tlu.jobplatform.shared.exception.BusinessRuleException(
                                        "Bạn cần mua gói PRO để sử dụng tính năng boost CV.",
                                        "NO_ACTIVE_CANDIDATE_SUBSCRIPTION");
                }
                if (!quota.canBoostCv()) {
                        throw new edu.tlu.jobplatform.shared.exception.BusinessRuleException(
                                        "Gói " + quota.planCode() + " không hỗ trợ tính năng boost CV. "
                                                        + "Vui lòng nâng cấp lên gói PRO hoặc PREMIUM.",
                                        "CV_BOOST_NOT_AVAILABLE_ON_CURRENT_PLAN");
                }

                consumeQuotaUseCase.execute(candidateId, ConsumeCandidateQuotaUseCase.QuotaType.CV_BOOST);

                LocalDateTime boostedUntil = LocalDateTime.now().plusDays(BOOST_DAYS);
                profile.boost(boostedUntil);
                profileRepository.save(profile);

                CheckCandidateQuotaUseCase.Result updatedQuota = checkQuotaUseCase.execute(candidateId);

                log.info("[BoostCV] candidateId={} boostedUntil={} boostsRemaining={}",
                                candidateId, boostedUntil, updatedQuota.cvBoostsRemaining());

                return new Result(
                                boostedUntil,
                                BOOST_DAYS,
                                updatedQuota.cvBoostsRemaining(),
                                true);
        }

        public record Result(
                        LocalDateTime boostedUntil,
                        int boostDays,
                        int boostsRemaining,
                        boolean currentlyBoosted) {
        }
}