package edu.tlu.jobplatform.notification.infrastructure.event;

import edu.tlu.jobplatform.notification.application.usecase.CreateNotificationUseCase;
import edu.tlu.jobplatform.notification.domain.model.NotificationType;
import edu.tlu.jobplatform.shared.event.review.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReviewNotificationHandler {

        private final CreateNotificationUseCase createNotification;

        /**
         * Review mới → thông báo cho company admin (owner của công ty).
         * Dùng companyOwnerId để route đúng người nhận.
         */
        @Async("taskExecutor")
        @EventListener
        public void onReviewCreated(ReviewCreatedEvent event) {
                String reviewerDisplay = event.isAnonymous() ? "Ẩn danh" : event.getReviewerName();

                createNotification.execute(new CreateNotificationUseCase.Command(
                                event.getCompanyOwnerId(),
                                NotificationType.REVIEW_CREATED,
                                "Có đánh giá mới cần duyệt",
                                "%s vừa gửi đánh giá %d⭐ cho công ty. Vui lòng kiểm duyệt."
                                                .formatted(reviewerDisplay, event.getRating()),
                                "/employer/reviews"));
        }

        /**
         * Review được duyệt → thông báo cho reviewer.
         */
        @Async("taskExecutor")
        @EventListener
        public void onReviewApproved(ReviewApprovedEvent event) {
                createNotification.execute(new CreateNotificationUseCase.Command(
                                event.getReviewerId(),
                                NotificationType.REVIEW_APPROVED,
                                "Đánh giá của bạn đã được duyệt",
                                "Đánh giá %d⭐ của bạn đã được phê duyệt và hiển thị công khai."
                                                .formatted(event.getRating()),
                                "/candidate/reviews/" + event.getReviewId()));
        }

        /**
         * Review bị từ chối → thông báo cho reviewer kèm lý do.
         */
        @Async("taskExecutor")
        @EventListener
        public void onReviewRejected(ReviewRejectedEvent event) {
                createNotification.execute(new CreateNotificationUseCase.Command(
                                event.getReviewerId(),
                                NotificationType.REVIEW_REJECTED,
                                "Đánh giá của bạn bị từ chối",
                                "Đánh giá của bạn chưa được duyệt. Lý do: %s"
                                                .formatted(event.getReason()),
                                "/candidate/reviews/" + event.getReviewId() + "/edit"));
        }

        /**
         * Review được cập nhật → thông báo lại cho company admin để duyệt lại.
         */
        @Async("taskExecutor")
        @EventListener
        public void onReviewUpdated(ReviewUpdatedEvent event) {
                createNotification.execute(new CreateNotificationUseCase.Command(
                                event.getCompanyOwnerId(),
                                NotificationType.REVIEW_UPDATED,
                                "Đánh giá đã được chỉnh sửa",
                                "Một đánh giá vừa được cập nhật và cần duyệt lại.",
                                "/employer/reviews"));
        }
}