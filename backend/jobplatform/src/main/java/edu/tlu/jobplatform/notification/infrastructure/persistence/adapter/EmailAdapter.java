package edu.tlu.jobplatform.notification.infrastructure.persistence.adapter;

import edu.tlu.jobplatform.notification.application.port.out.EmailPort;
import org.springframework.stereotype.Component;

@Component
public class EmailAdapter implements EmailPort {

    @Override
    public void sendVerificationOtp(String to, String fullName, String otp) {
        // TODO: logic gửi OTP qua email
        System.out.println("Sending OTP to " + to + ", name: " + fullName + ", OTP: " + otp);
    }

    @Override
    public void sendNotificationEmail(String to, String title, String body, String link) {
        // TODO: logic gửi thông báo qua email
        System.out.println("Sending notification to " + to + " | Title: " + title + " | Link: " + link);
    }

    @Override
    public void sendApplicationStatusChanged(String to, String candidateName,
            String jobTitle, String newStatus,
            String companyName) {
        // TODO: logic gửi email trạng thái ứng tuyển
        System.out.println(
                "Application status changed for " + candidateName + " | Job: " + jobTitle + " | Status: " + newStatus);
    }

    @Override
    public void sendInterviewScheduled(String to, String candidateName,
            String jobTitle, String companyName,
            String scheduledAt, String meetingLink) {
        // TODO: logic gửi email lịch phỏng vấn
        System.out.println("Interview scheduled for " + candidateName + " | Job: " + jobTitle + " | At: " + scheduledAt
                + " | Link: " + meetingLink);
    }
}