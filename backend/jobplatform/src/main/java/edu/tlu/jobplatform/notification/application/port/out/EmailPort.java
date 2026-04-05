package edu.tlu.jobplatform.notification.application.port.out;

public interface EmailPort {

        void sendVerificationOtp(String to, String fullName, String otp);

        void sendNotificationEmail(String to, String title, String body, String link);

        void sendApplicationStatusChanged(String to, String candidateName,
                        String jobTitle, String newStatus,
                        String companyName);

        void sendInterviewScheduled(String to, String candidateName,
                        String jobTitle, String companyName,
                        String scheduledAt, String meetingLink);
}