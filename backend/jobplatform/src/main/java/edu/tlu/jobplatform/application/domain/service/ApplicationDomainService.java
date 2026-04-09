package edu.tlu.jobplatform.application.domain.service;

import edu.tlu.jobplatform.application.domain.model.Application;
import edu.tlu.jobplatform.application.domain.model.ApplicationStatusLog;
import edu.tlu.jobplatform.application.domain.model.vo.ApplicationStatus;
import edu.tlu.jobplatform.application.domain.repository.ApplicationStatusLogRepository;
import edu.tlu.jobplatform.shared.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationDomainService {

    private final ApplicationStatusLogRepository logRepository;

    /**
     * Ghi log mỗi khi status thay đổi.
     * Gọi sau khi đã update status thành công.
     */
    public void logStatusChange(Application application,
            ApplicationStatus fromStatus,
            String note,
            UUID changedBy) {
        ApplicationStatusLog log = ApplicationStatusLog.builder()
                .id(UUID.randomUUID())
                .applicationId(application.getId())
                .fromStatus(fromStatus)
                .toStatus(application.getStatus())
                .note(note)
                .changedBy(changedBy)
                .changedAt(LocalDateTime.now())
                .build();
        logRepository.save(log);
    }

    /**
     * Validate trước khi submit đơn.
     * BR-01: Phải có CV URL
     * BR-02: Bài đăng phải đang nhận CV (isAcceptingApplications)
     */
    public void validateSubmission(String cvUrl, boolean jobAccepting) {
        if (cvUrl == null || cvUrl.isBlank())
            throw new BusinessRuleException(
                    "Vui lòng upload CV trước khi nộp đơn.", "CV_REQUIRED");

        if (!jobAccepting)
            throw new BusinessRuleException(
                    "Bài đăng này không còn nhận CV.",
                    "JOB_NOT_ACCEPTING_APPLICATIONS");
    }

    /**
     * Validate lịch phỏng vấn.
     */
    public void validateInterviewSchedule(LocalDateTime scheduledAt) {
        if (scheduledAt == null)
            throw new BusinessRuleException(
                    "Vui lòng chọn thời gian phỏng vấn.", "INTERVIEW_TIME_REQUIRED");

        if (scheduledAt.isBefore(LocalDateTime.now().plusHours(1)))
            throw new BusinessRuleException(
                    "Thời gian phỏng vấn phải sau ít nhất 1 giờ từ bây giờ.",
                    "INTERVIEW_TIME_TOO_SOON");
    }
}