package edu.tlu.jobplatform.application.usecase.candidate;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.domain.repository.ApplicationRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import edu.tlu.jobplatform.shared.exception.ResourceNotFoundException;
import edu.tlu.jobplatform.subscription.application.usecase.ConsumeCandidateQuotaUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * UseCase: Candidate rút đơn ứng tuyển.
 *
 * Khi rút đơn thành công → hoàn lại 1 lượt applicationQuota.
 *
 * Lý do hoàn quota:
 * Candidate đã trả tiền cho lượt ứng tuyển này.
 * Nếu họ rút đơn (không phải bị từ chối), hệ thống nên
 * hoàn lại để họ có thể ứng tuyển vào vị trí khác.
 *
 * Trường hợp KHÔNG hoàn quota:
 * - Application bị REJECTED bởi employer → không hoàn
 * (candidate đã dùng lượt, employer đã xem xét)
 * - Application đã HIRED → không hoàn
 *
 * Rollback safety:
 * refund() nằm trong cùng @Transactional → nếu
 * applicationRepo.save() thất bại, quota refund cũng rollback.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WithdrawApplicationUseCase {

    private final ApplicationRepository applicationRepo;
    private final ConsumeCandidateQuotaUseCase consumeQuotaUseCase;

    @Transactional
    public void execute(UUID applicationId, UUID candidateId) {

        Application application = applicationRepo.findById(applicationId)
                .orElseThrow(() -> ResourceNotFoundException.of("Application", applicationId));

        // Chỉ owner mới được rút
        if (!application.getCandidateId().equals(candidateId))
            throw new BusinessRuleException(
                    "Bạn không có quyền rút đơn này.", "FORBIDDEN");

        // Chỉ rút được khi đang SUBMITTED hoặc REVIEWING
        if (application.getStatus() == ApplicationStatus.HIRED
                || application.getStatus() == ApplicationStatus.REJECTED
                || application.getStatus() == ApplicationStatus.WITHDRAWN)
            throw new BusinessRuleException(
                    "Không thể rút đơn ở trạng thái: " + application.getStatus(),
                    "INVALID_STATUS_FOR_WITHDRAWAL");

        application.withdraw();
        applicationRepo.save(application);

        // Hoàn lại quota — silently fail nếu không có subscription active
        // (ví dụ: subscription đã expire sau khi nộp đơn)
        try {
            consumeQuotaUseCase.refund(
                    candidateId, ConsumeCandidateQuotaUseCase.QuotaType.APPLICATION);
        } catch (Exception e) {
            // Không throw — việc hoàn quota thất bại không nên block việc rút đơn
            log.warn("[WithdrawApplication] Quota refund skipped: candidateId={} reason={}",
                    candidateId, e.getMessage());
        }

        log.info("[WithdrawApplication] Withdrawn: applicationId={} candidateId={}",
                applicationId, candidateId);
    }
}