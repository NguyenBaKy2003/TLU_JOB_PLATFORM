package edu.tlu.jobplatform.notification.infrastructure.event;

import edu.tlu.jobplatform.notification.application.usecase.CreateNotificationUseCase;
import edu.tlu.jobplatform.notification.domain.model.NotificationType;
import edu.tlu.jobplatform.shared.event.company.CompanyRejectedEvent;
import edu.tlu.jobplatform.shared.event.company.CompanyVerifiedEvent;
import edu.tlu.jobplatform.shared.event.job.JobPostApprovedEvent;
import edu.tlu.jobplatform.shared.event.job.JobPostRejectedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminActionNotificationHandler {

        private final CreateNotificationUseCase createNotification;

        @Async("taskExecutor")
        @EventListener
        public void onCompanyVerified(CompanyVerifiedEvent event) {
                createNotification.execute(new CreateNotificationUseCase.Command(
                                event.getOwnerId(),
                                NotificationType.COMPANY_VERIFIED,
                                "Công ty đã được xác thực",
                                "Công ty %s đã được xác thực. Bạn có thể bắt đầu đăng tin tuyển dụng."
                                                .formatted(event.getCompanyName()),
                                "/employer/profile"));
        }

        @Async("taskExecutor")
        @EventListener
        public void onCompanyRejected(CompanyRejectedEvent event) {
                createNotification.execute(new CreateNotificationUseCase.Command(
                                event.getOwnerId(),
                                NotificationType.COMPANY_REJECTED,
                                "Yêu cầu xác thực bị từ chối",
                                "Công ty %s chưa được xác thực. Lý do: %s"
                                                .formatted(event.getCompanyName(), event.getReason()),
                                "/employer/profile/edit"));
        }

        @Async("taskExecutor")
        @EventListener
        public void onJobPostApproved(JobPostApprovedEvent event) {
                createNotification.execute(new CreateNotificationUseCase.Command(
                                event.getEmployerId(),
                                NotificationType.JOB_POST_APPROVED,
                                "Tin tuyển dụng đã được duyệt",
                                "Bài đăng \"%s\" đã được phê duyệt và hiển thị công khai."
                                                .formatted(event.getJobTitle()),
                                "/jobs/" + event.getJobPostId()));
        }

        @Async("taskExecutor")
        @EventListener
        public void onJobPostRejected(JobPostRejectedEvent event) {
                createNotification.execute(new CreateNotificationUseCase.Command(
                                event.getEmployerId(),
                                NotificationType.JOB_POST_REJECTED,
                                "Tin tuyển dụng bị từ chối",
                                "Bài đăng \"%s\" chưa được duyệt. Lý do: %s"
                                                .formatted(event.getJobTitle(), event.getReason()),
                                "/employer/jobs/" + event.getJobPostId() + "/edit"));
        }
}