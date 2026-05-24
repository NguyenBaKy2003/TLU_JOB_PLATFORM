package edu.tlu.jobplatform.cv.application.usecase;

import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;
import edu.tlu.jobplatform.cv.domain.model.vo.CVStatus;
import edu.tlu.jobplatform.cv.domain.model.vo.CVVisibility;
import edu.tlu.jobplatform.cv.domain.repository.CVTemplateRepository;
import edu.tlu.jobplatform.cv.domain.repository.OnlineCVRepository;
import edu.tlu.jobplatform.cv.domain.service.CVDomainService;
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
 * Thay đổi so với version cũ:
 * ─────────────────────────────────────────────────────────────────
 * Thêm check: nếu template là PREMIUM (isPremium = true),
 * candidate phải có gói PRO trở lên (planCode = PRO hoặc PREMIUM).
 *
 * Lý do dùng CheckCandidateQuotaUseCase thay vì inject
 * CandidateSubscriptionRepository trực tiếp:
 * - Tránh cross-domain dependency (cv → subscription domain)
 * - CheckCandidateQuotaUseCase đã encapsulate logic "có subscription active
 * không"
 * - Nhất quán với cách SubmitApplicationUseCase check quota
 *
 * Mapping planCode → quyền dùng premium template:
 * - null / không có subscription → chỉ dùng free template
 * - BASIC (free tier) → chỉ dùng free template
 * - PRO → dùng được premium template
 * - PREMIUM → dùng được premium template
 * ─────────────────────────────────────────────────────────────────
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CreateOnlineCVUseCase {

        private final OnlineCVRepository cvRepository;
        private final CVTemplateRepository templateRepository;
        private final CVDomainService cvDomainService;
        private final CheckCandidateQuotaUseCase checkQuotaUseCase;

        public record Command(
                        UUID candidateId,
                        String title,
                        UUID templateId // null = dùng template mặc định
        ) {
        }

        @Transactional
        public OnlineCV execute(Command cmd) {

                // 1. Kiểm tra giới hạn số CV (tối đa 10)
                cvDomainService.validateCanCreateCV(cmd.candidateId());

                // 2. Load template
                CVTemplate template;
                if (cmd.templateId() != null) {
                        template = templateRepository.findById(cmd.templateId())
                                        .orElseThrow(() -> new BusinessRuleException(
                                                        "Template không tồn tại.", "TEMPLATE_NOT_FOUND"));

                        // 3. Nếu là premium template → check subscription
                        if (template.isPremium()) {
                                checkPremiumTemplateAccess(cmd.candidateId());
                        }
                } else {
                        // Không truyền templateId → lấy template free mặc định
                        template = templateRepository.findByPremium(false)
                                        .stream().findFirst()
                                        .orElseThrow(() -> new BusinessRuleException(
                                                        "Không có template mặc định.", "NO_DEFAULT_TEMPLATE"));
                }

                // 4. Tạo CV
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
                log.info("[CreateCV] Created: cvId={} candidateId={} template={} isPremium={}",
                                saved.getId(), saved.getCandidateId(),
                                template.getName(), template.isPremium());
                return saved;
        }

        /**
         * Check candidate có quyền dùng premium template không.
         * PRO và PREMIUM đều được — chỉ BASIC và không có gói là không.
         */
        private void checkPremiumTemplateAccess(UUID candidateId) {
                CheckCandidateQuotaUseCase.Result quota = checkQuotaUseCase.execute(candidateId);

                boolean hasPremiumAccess = quota.hasActiveSubscription()
                                && quota.planCode() != null
                                && !quota.planCode().equalsIgnoreCase("BASIC");

                if (!hasPremiumAccess) {
                        throw new BusinessRuleException(
                                        "Template này chỉ dành cho gói PRO trở lên. " +
                                                        "Vui lòng nâng cấp gói để sử dụng template cao cấp.",
                                        "PREMIUM_TEMPLATE_NOT_AVAILABLE");
                }
        }
}