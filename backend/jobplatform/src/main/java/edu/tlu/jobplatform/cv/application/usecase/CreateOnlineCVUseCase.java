package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.model.vo.CVStatus;
import edu.tlu.jobplatform.cv.domain.model.vo.CVVisibility;
import edu.tlu.jobplatform.cv.domain.repository.CVTemplateRepository;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.subscription.application.usecase.CheckCandidateQuotaUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.UUID;

/**
 * Tạo CV mới từ template.
 *
 * Logic check subscription (2 tầng):
 * ─────────────────────────────────────────────────────────────────
 * 1. Giới hạn số CV (cvCreateLimit từ subscription):
 * FREE_CANDIDATE = 1, PRO = 5, PREMIUM = -1 (unlimited)
 * Không có subscription → áp dụng limit = 1 (FREE behavior)
 *
 * 2. Template premium (premiumTemplateAccess từ subscription):
 * template.isPremium() = true → cần PRO hoặc PREMIUM
 * FREE_CANDIDATE hoặc không có gói → chỉ dùng template thường
 *
 * Tại sao dùng CheckCandidateQuotaUseCase thay vì
 * CandidateSubscriptionRepository trực tiếp:
 * → Tránh cross-domain dependency (cv domain → subscription domain)
 * → CheckCandidateQuotaUseCase encapsulate toàn bộ subscription logic
 * ─────────────────────────────────────────────────────────────────
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CreateOnlineCVUseCase {

        /** Limit mặc định khi candidate không có subscription — bằng FREE tier */
        private static final int DEFAULT_CV_LIMIT = 1;

        private final OnlineCVRepository cvRepository;
        private final CVTemplateRepository templateRepository;
        private final CheckCandidateQuotaUseCase checkQuotaUseCase;

        public record Command(UUID candidateId, String title, UUID templateId) {
        }

        @Transactional
        public OnlineCV execute(Command cmd) {

                // 1. Load quota từ subscription
                CheckCandidateQuotaUseCase.Result quota = checkQuotaUseCase.execute(cmd.candidateId());

                // 2. Check giới hạn số CV
                int cvLimit = quota.hasActiveSubscription()
                                ? quota.cvCreateLimit()
                                : DEFAULT_CV_LIMIT;

                if (cvLimit >= 0) {
                        // cvLimit = -1 → unlimited, không cần count
                        long currentCount = cvRepository.countByCandidateId(cmd.candidateId());
                        if (currentCount >= cvLimit) {
                                String hint = quota.hasActiveSubscription()
                                                ? "Nâng cấp lên gói PREMIUM để tạo không giới hạn CV."
                                                : "Mua gói PRO để tạo tối đa 5 CV.";
                                throw new BusinessRuleException(
                                                "Bạn đã đạt giới hạn " + cvLimit + " CV. " + hint,
                                                "CV_CREATE_LIMIT_REACHED");
                        }
                }

                // 3. Load template
                CVTemplate template;
                if (cmd.templateId() != null) {
                        template = templateRepository.findById(cmd.templateId())
                                        .orElseThrow(() -> new BusinessRuleException(
                                                        "Template không tồn tại.", "TEMPLATE_NOT_FOUND"));

                        // 4. Check premium template
                        if (template.isPremium() && !quota.premiumTemplateAccess()) {
                                throw new BusinessRuleException(
                                                "Template này chỉ dành cho gói PRO trở lên. "
                                                                + "Vui lòng nâng cấp để sử dụng template cao cấp.",
                                                "PREMIUM_TEMPLATE_NOT_AVAILABLE");
                        }
                } else {
                        // Không truyền templateId → lấy template free mặc định
                        template = templateRepository.findByPremium(false)
                                        .stream().findFirst()
                                        .orElseThrow(() -> new BusinessRuleException(
                                                        "Không có template mặc định.", "NO_DEFAULT_TEMPLATE"));
                }

                // 5. Tạo CV
                OnlineCV cv = OnlineCV.builder()
                                .id(UUID.randomUUID())
                                .candidateId(cmd.candidateId())
                                .title(cmd.title() != null ? cmd.title() : "CV của tôi")
                                .templateId(template.getId())
                                .sections(new ArrayList<>())
                                .status(CVStatus.DRAFT)
                                .visibility(CVVisibility.PRIVATE)
                                .viewCount(0L)
                                .createdAt(LocalDateTime.now())
                                .updatedAt(LocalDateTime.now())
                                .build();

                OnlineCV saved = cvRepository.save(cv);
                log.info("[CreateCV] cvId={} candidateId={} template={} isPremium={} count={}/{}",
                                saved.getId(), saved.getCandidateId(),
                                template.getName(), template.isPremium(),
                                cvRepository.countByCandidateId(cmd.candidateId()),
                                cvLimit < 0 ? "∞" : cvLimit);
                return saved;
        }
}