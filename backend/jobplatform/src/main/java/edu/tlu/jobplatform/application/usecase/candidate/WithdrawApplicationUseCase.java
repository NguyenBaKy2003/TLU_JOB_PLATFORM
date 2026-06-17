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

                try {
                        consumeQuotaUseCase.refund(
                                        candidateId, ConsumeCandidateQuotaUseCase.QuotaType.APPLICATION);
                } catch (Exception e) {
                        log.warn("[WithdrawApplication] Quota refund skipped: candidateId={} reason={}",
                                        candidateId, e.getMessage());
                }

                log.info("[WithdrawApplication] Withdrawn: applicationId={} candidateId={}",
                                applicationId, candidateId);
        }
}