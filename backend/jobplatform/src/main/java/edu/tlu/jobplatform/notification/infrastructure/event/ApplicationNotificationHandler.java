// package edu.tlu.jobplatform.notification.infrastructure.event;

// import
// edu.tlu.jobplatform.notification.application.usecase.CreateNotificationUseCase;
// import edu.tlu.jobplatform.notification.domain.model.NotificationType;
// import
// edu.tlu.jobplatform.shared.event.application.ApplicationStatusChangedEvent;
// import
// edu.tlu.jobplatform.shared.event.application.ApplicationSubmittedEvent;
// import edu.tlu.jobplatform.shared.event.application.InterviewScheduledEvent;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.context.event.EventListener;
// import org.springframework.scheduling.annotation.Async;
// import org.springframework.stereotype.Component;

// @Slf4j
// @Component
// @RequiredArgsConstructor
// public class ApplicationNotificationHandler {

// private final CreateNotificationUseCase createNotification;

// /** Candidate nộp đơn → notify employer */
// @Async("taskExecutor")
// @EventListener
// public void onApplicationSubmitted(ApplicationSubmittedEvent event) {
// createNotification.execute(new CreateNotificationUseCase.Command(
// event.employerId(),
// event.employerEmail(),
// NotificationType.NEW_APPLICATION_RECEIVED,
// "Có ứng viên mới ứng tuyển",
// "%s vừa nộp đơn vào vị trí %s."
// .formatted(event.candidateName(), event.jobTitle()),
// "/employer/applications/" + event.applicationId()));
// }

// /** Employer đổi trạng thái → notify candidate */
// @Async("taskExecutor")
// @EventListener
// public void onApplicationStatusChanged(ApplicationStatusChangedEvent event) {
// createNotification.execute(new CreateNotificationUseCase.Command(
// event.candidateId(),
// event.candidateEmail(),
// NotificationType.APPLICATION_STATUS_CHANGED,
// buildStatusTitle(event.newStatus()),
// buildStatusBody(event.newStatus(), event.companyName(), event.jobTitle()),
// "/candidate/applications/" + event.applicationId()));
// }

// /** Lịch phỏng vấn → notify candidate */
// @Async("taskExecutor")
// @EventListener
// public void onInterviewScheduled(InterviewScheduledEvent event) {
// createNotification.execute(new CreateNotificationUseCase.Command(
// event.candidateId(),
// event.candidateEmail(),
// NotificationType.INTERVIEW_SCHEDULED,
// "Lịch phỏng vấn đã được xếp",
// "Phỏng vấn với %s cho vị trí %s vào %s."
// .formatted(event.companyName(), event.jobTitle(), event.scheduledAt()),
// "/candidate/interviews/" + event.interviewId()));
// }

// // ── Helpers ───────────────────────────────────────────────────────────────

// private String buildStatusTitle(String status) {
// return switch (status) {
// case "REVIEWING" -> "Hồ sơ đang được xem xét";
// case "INTERVIEW" -> "Bạn được mời phỏng vấn!";
// case "OFFERED" -> "Chúc mừng! Bạn nhận được offer";
// case "REJECTED" -> "Kết quả ứng tuyển";
// default -> "Cập nhật trạng thái ứng tuyển";
// };
// }

// private String buildStatusBody(String status, String company, String job) {
// return switch (status) {
// case "REVIEWING" -> "%s đang xem xét hồ sơ của bạn cho vị trí %s."
// .formatted(company, job);
// case "INTERVIEW" -> "%s muốn phỏng vấn bạn cho vị trí %s."
// .formatted(company, job);
// case "OFFERED" -> "%s đã gửi offer cho vị trí %s. Vào xem chi tiết ngay!"
// .formatted(company, job);
// case "REJECTED" -> "Rất tiếc, %s không tiến hành với hồ sơ của bạn lần này."
// .formatted(company);
// default -> "Trạng thái đơn ứng tuyển của bạn đã được cập nhật.";
// };
// }
// }