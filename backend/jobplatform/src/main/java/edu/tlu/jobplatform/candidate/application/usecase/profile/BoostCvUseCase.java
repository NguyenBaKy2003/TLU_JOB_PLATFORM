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

/**
 * UseCase: Candidate boost CV/profile lên top kết quả tìm kiếm employer.
 *
 * Cơ chế:
 * ──────────────────────────────────────────────────────────────────
 * - Set boostedUntil = now() + BOOST_DAYS (7 ngày) trên CandidateProfile
 * - Employer search → kết quả sort ưu tiên candidate có boostedUntil > now()
 * - Hết hạn → tự nhiên mất ưu tiên (không cần scheduler xóa)
 *
 * Quota:
 * - FREE_CANDIDATE : cvBoostLimit = 0 → ném CV_BOOST_QUOTA_EXCEEDED
 * - PRO : 3 lần/tháng (reset đầu tháng)
 * - PREMIUM : unlimited (-1)
 *
 * Idempotency:
 * - Nếu đang có boost hiệu lực → gia hạn thêm 7 ngày từ now()
 * (không cộng dồn từ boostedUntil cũ để tránh extend vô hạn)
 * - Mỗi lần boost đều trừ 1 quota, kể cả khi đang boost
 *
 * Rollback safety:
 * - @Transactional: nếu save profile thất bại → quota refund tự động
 * (quota consume và profile save cùng transaction)
 * ──────────────────────────────────────────────────────────────────
 */
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

                // 1. Load profile trước — cần check boostedUntil
                CandidateProfile profile = profileRepository.findByUserId(candidateId)
                                .orElseThrow(() -> ResourceNotFoundException.of("CandidateProfile", candidateId));

                // 2. Chặn boost khi đang còn hiệu lực — bảo vệ quota candidate
                if (profile.isBoosted()) {
                        throw new edu.tlu.jobplatform.shared.exception.BusinessRuleException(
                                        String.format(
                                                        "Hồ sơ của bạn đang được boost đến %s. Bạn chỉ có thể boost lại sau khi hết hạn.",
                                                        profile.getBoostedUntil().toLocalDate()),
                                        "CV_BOOST_STILL_ACTIVE");
                }

                // 3. Check subscription
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

                // 4. Trừ quota — ném CV_BOOST_QUOTA_EXCEEDED nếu hết
                consumeQuotaUseCase.execute(candidateId, ConsumeCandidateQuotaUseCase.QuotaType.CV_BOOST);

                // 5. Set boostedUntil = now() + 7 ngày
                LocalDateTime boostedUntil = LocalDateTime.now().plusDays(BOOST_DAYS);
                profile.boost(boostedUntil);
                profileRepository.save(profile);

                // 6. Load quota sau khi trừ để trả remaining chính xác
                CheckCandidateQuotaUseCase.Result updatedQuota = checkQuotaUseCase.execute(candidateId);

                log.info("[BoostCV] candidateId={} boostedUntil={} boostsRemaining={}",
                                candidateId, boostedUntil, updatedQuota.cvBoostsRemaining());

                return new Result(
                                boostedUntil,
                                BOOST_DAYS,
                                updatedQuota.cvBoostsRemaining(),
                                true);
        }

        /**
         * @param boostedUntil     thời điểm hết hiệu lực boost
         * @param boostDays        số ngày boost (7)
         * @param boostsRemaining  số lần boost còn lại trong tháng (-1 = unlimited)
         * @param currentlyBoosted luôn true khi trả về từ execute thành công
         */
        public record Result(
                        LocalDateTime boostedUntil,
                        int boostDays,
                        int boostsRemaining,
                        boolean currentlyBoosted) {
        }
}