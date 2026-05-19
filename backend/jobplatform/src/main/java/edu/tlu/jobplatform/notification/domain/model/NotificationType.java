package edu.tlu.jobplatform.notification.domain.model;

public enum NotificationType {

    // ── Candidate nhận
    APPLICATION_SUBMITTED,
    APPLICATION_STATUS_CHANGED,
    INTERVIEW_SCHEDULED,
    INTERVIEW_REMINDER,

    // ── Employer nhận ─
    NEW_APPLICATION_RECEIVED,
    COMPANY_VERIFIED,
    COMPANY_REJECTED,
    JOB_POST_APPROVED,
    JOB_POST_REJECTED,
    JOB_POST_EXPIRING_SOON,
    SUBSCRIPTION_EXPIRING_SOON,
    SUBSCRIPTION_EXPIRED,
    PAYMENT_SUCCESS,
    PAYMENT_FAILED,

    // ── Chung ─
    NEW_MESSAGE, // badge only — không gửi email
    SYSTEM_ANNOUNCEMENT, // không gửi email

    // Review types — thêm mới
    REVIEW_CREATED,
    REVIEW_APPROVED,
    REVIEW_REJECTED,
    REVIEW_UPDATED
}