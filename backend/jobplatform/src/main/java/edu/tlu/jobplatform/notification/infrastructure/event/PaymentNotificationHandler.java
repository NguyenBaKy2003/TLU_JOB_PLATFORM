package edu.tlu.jobplatform.notification.infrastructure.event;

import edu.tlu.jobplatform.notification.application.usecase.CreateNotificationUseCase;
import edu.tlu.jobplatform.notification.domain.model.NotificationType;
import edu.tlu.jobplatform.shared.event.subscription.SubscriptionActivatedEvent;
import edu.tlu.jobplatform.shared.event.subscription.SubscriptionExpiredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentNotificationHandler {

        private final CreateNotificationUseCase createNotification;

        @Async("taskExecutor")
        @EventListener
        public void onSubscriptionActivated(SubscriptionActivatedEvent event) {
                createNotification.execute(new CreateNotificationUseCase.Command(
                                event.getCompanyId(),
                                NotificationType.PAYMENT_SUCCESS,
                                "Thanh toán thành công",
                                "Gói %s đã được kích hoạt. Hiệu lực đến %s."
                                                .formatted(event.getPlanName(), event.getExpiresAt()),
                                "/employer/subscription"));
        }

        @Async("taskExecutor")
        @EventListener
        public void onSubscriptionExpired(SubscriptionExpiredEvent event) {
                createNotification.execute(new CreateNotificationUseCase.Command(
                                event.getCompanyId(),
                                NotificationType.SUBSCRIPTION_EXPIRED,
                                "Gói đăng ký đã hết hạn",
                                "Gói %s đã hết hạn. Vui lòng gia hạn để tiếp tục đăng tin."
                                                .formatted(event.getPlanCode()),
                                "/employer/subscription"));
        }
}