// package edu.tlu.jobplatform.notification.infrastructure.event;

// import
// edu.tlu.jobplatform.notification.application.usecase.CreateNotificationUseCase;
// import edu.tlu.jobplatform.notification.domain.model.NotificationType;
// import edu.tlu.jobplatform.shared.event.subscription.PaymentSuccessEvent;
// import
// edu.tlu.jobplatform.shared.event.subscription.SubscriptionExpiredEvent;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.context.event.EventListener;
// import org.springframework.scheduling.annotation.Async;
// import org.springframework.stereotype.Component;

// @Slf4j
// @Component
// @RequiredArgsConstructor
// public class PaymentNotificationHandler {

// private final CreateNotificationUseCase createNotification;

// @Async("taskExecutor")
// @EventListener
// public void onPaymentSuccess(PaymentSuccessEvent event) {
// createNotification.execute(new CreateNotificationUseCase.Command(
// event.userId(),
// event.userEmail(),
// NotificationType.PAYMENT_SUCCESS,
// "Thanh toán thành công",
// "Gói %s đã được kích hoạt. Hiệu lực đến %s."
// .formatted(event.planName(), event.expiresAt()),
// "/employer/subscription"));
// }

// @Async("taskExecutor")
// @EventListener
// public void onSubscriptionExpiring(SubscriptionExpiringEvent event) {
// createNotification.execute(new CreateNotificationUseCase.Command(
// event.userId(),
// event.userEmail(),
// NotificationType.SUBSCRIPTION_EXPIRING_SOON,
// "Gói đăng ký sắp hết hạn",
// "Gói %s sẽ hết hạn sau %d ngày. Gia hạn ngay để không gián đoạn."
// .formatted(event.planName(), event.daysLeft()),
// "/employer/subscription/renew"));
// }

// @Async("taskExecutor")
// @EventListener
// public void onSubscriptionExpired(SubscriptionExpiredEvent event) {
// createNotification.execute(new CreateNotificationUseCase.Command(
// event.userId(),
// event.userEmail(),
// NotificationType.SUBSCRIPTION_EXPIRED,
// "Gói đăng ký đã hết hạn",
// "Gói %s đã hết hạn. Đăng bài tuyển dụng sẽ bị tạm dừng cho đến khi gia hạn."
// .formatted(event.planName()),
// "/employer/subscription"));
// }
// }